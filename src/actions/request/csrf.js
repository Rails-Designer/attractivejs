export const csrf = {
  header: null,
  token: null
};

// Backward compat for request.js (removed in plan 99)
export class CSRF {
  static get() {
    return typeof csrf.token === "function" ? csrf.token() : csrf.token;
  }
}
