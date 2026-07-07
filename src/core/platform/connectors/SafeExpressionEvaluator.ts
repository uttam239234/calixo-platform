/**
 * Calixo Platform - Safe Expression Evaluator
 *
 * `TransformationRule.expression` (calculated fields, filters) can be
 * authored by third-party connector developers (see the Developer SDK,
 * §17 of the mandate). Evaluating that with `eval()`/`new Function()`
 * would be a real code-injection vulnerability — a malicious or buggy
 * manifest could run arbitrary code in the platform's process. This is a
 * small, deliberately restricted recursive-descent parser/evaluator
 * instead: identifiers (record field lookups), number/string literals,
 * `+ - * / > >= < <= == != && ||` and parentheses. No function calls, no
 * property access beyond a bare field name, no assignment — nothing it
 * evaluates can escape arithmetic/comparison over the record it's given.
 */

type Token = { type: "num" | "str" | "id" | "op" | "lparen" | "rparen"; value: string };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === "(") { tokens.push({ type: "lparen", value: ch }); i++; continue; }
    if (ch === ")") { tokens.push({ type: "rparen", value: ch }); i++; continue; }
    if (/[0-9]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) { num += expr[i]; i++; }
      tokens.push({ type: "num", value: num });
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let str = "";
      i++;
      while (i < expr.length && expr[i] !== quote) { str += expr[i]; i++; }
      i++; // closing quote
      tokens.push({ type: "str", value: str });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let id = "";
      while (i < expr.length && /[a-zA-Z0-9_.]/.test(expr[i])) { id += expr[i]; i++; }
      tokens.push({ type: "id", value: id });
      continue;
    }
    const twoChar = expr.slice(i, i + 2);
    if (["==", "!=", ">=", "<=", "&&", "||"].includes(twoChar)) {
      tokens.push({ type: "op", value: twoChar });
      i += 2;
      continue;
    }
    if (["+", "-", "*", "/", ">", "<"].includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    throw new Error(`Unexpected character in expression: '${ch}'`);
  }
  return tokens;
}

const PRECEDENCE: Record<string, number> = { "||": 1, "&&": 2, "==": 3, "!=": 3, ">": 3, ">=": 3, "<": 3, "<=": 3, "+": 4, "-": 4, "*": 5, "/": 5 };

class Parser {
  private pos = 0;
  constructor(private tokens: Token[], private scope: Record<string, unknown>) {}

  private peek(): Token | undefined { return this.tokens[this.pos]; }
  private next(): Token { return this.tokens[this.pos++]; }

  parse(): unknown {
    const result = this.parseExpression(0);
    if (this.pos < this.tokens.length) throw new Error("Unexpected trailing tokens in expression");
    return result;
  }

  private parseExpression(minPrecedence: number): unknown {
    let left = this.parsePrimary();
    while (true) {
      const token = this.peek();
      if (!token || token.type !== "op") break;
      const precedence = PRECEDENCE[token.value];
      if (precedence === undefined || precedence < minPrecedence) break;
      this.next();
      const right = this.parseExpression(precedence + 1);
      left = this.applyOp(token.value, left, right);
    }
    return left;
  }

  private parsePrimary(): unknown {
    const token = this.next();
    if (!token) throw new Error("Unexpected end of expression");
    if (token.type === "num") return parseFloat(token.value);
    if (token.type === "str") return token.value;
    if (token.type === "id") return getByPath(this.scope, token.value);
    if (token.type === "lparen") {
      const value = this.parseExpression(0);
      const closing = this.next();
      if (!closing || closing.type !== "rparen") throw new Error("Missing closing parenthesis");
      return value;
    }
    if (token.type === "op" && token.value === "-") {
      return -(this.parsePrimary() as number);
    }
    throw new Error(`Unexpected token: ${token.value}`);
  }

  private applyOp(op: string, a: unknown, b: unknown): unknown {
    switch (op) {
      case "+": return (a as number) + (b as number);
      case "-": return (a as number) - (b as number);
      case "*": return (a as number) * (b as number);
      case "/": return (b as number) === 0 ? 0 : (a as number) / (b as number);
      case "==": return a === b;
      case "!=": return a !== b;
      case ">": return (a as number) > (b as number);
      case ">=": return (a as number) >= (b as number);
      case "<": return (a as number) < (b as number);
      case "<=": return (a as number) <= (b as number);
      case "&&": return Boolean(a) && Boolean(b);
      case "||": return Boolean(a) || Boolean(b);
      default: throw new Error(`Unknown operator: ${op}`);
    }
  }
}

function getByPath(scope: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, scope);
}

/** Evaluates a restricted arithmetic/comparison expression against `scope` (a record's fields). Throws on anything outside the supported grammar rather than silently falling back to a real JS evaluator. */
export function evaluateSafeExpression(expression: string, scope: Record<string, unknown>): unknown {
  const tokens = tokenize(expression);
  return new Parser(tokens, scope).parse();
}
