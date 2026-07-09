export function defaultEventModifier(registry) {
  registry.addEventModifier("window", () => true);
  registry.addEventModifier("document", () => true);
}
