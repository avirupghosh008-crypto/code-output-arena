export type TrackId =
  | "c-pointers"
  | "java-poly"
  | "python-scope"
  | "js-event-loop";

export type Language = "c" | "java" | "python" | "javascript";

export interface ExplanationLine {
  line: string;
  why: string;
}

export interface Question {
  id: string;
  track: TrackId;
  language: Language;
  prompt: string;
  snippet: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  compilerOutput: string;
  explanation: ExplanationLine[];
}

export const TRACKS: {
  id: TrackId;
  label: string;
  short: string;
  language: Language;
  accent: string;
}[] = [
  {
    id: "c-pointers",
    label: "C Pointers & Memory",
    short: "C / Memory",
    language: "c",
    accent: "#d6ff3f",
  },
  {
    id: "java-poly",
    label: "Java Polymorphism",
    short: "Java / Poly",
    language: "java",
    accent: "#ff8a3d",
  },
  {
    id: "python-scope",
    label: "Python Scope & Generators",
    short: "Python / Scope",
    language: "python",
    accent: "#5ce1ff",
  },
  {
    id: "js-event-loop",
    label: "JS Event Loop",
    short: "JS / Loop",
    language: "javascript",
    accent: "#ffd166",
  },
];

export const QUESTIONS: Question[] = [
  {
    id: "c-1",
    track: "c-pointers",
    language: "c",
    prompt: "What does this program print?",
    snippet: `#include <stdio.h>
int main() {
    int a = 5;
    int *p = &a;
    *p = 10;
    printf("%d", a);
    return 0;
}`,
    options: ["5", "10", "garbage", "compile error"],
    correctIndex: 1,
    compilerOutput: "10",
    explanation: [
      { line: "int *p = &a;", why: "p stores the address of a." },
      { line: "*p = 10;", why: "Dereferencing p writes 10 into a itself." },
      { line: 'printf("%d", a);', why: "a is now 10, so the stdout is 10." },
    ],
  },
  {
    id: "c-2",
    track: "c-pointers",
    language: "c",
    prompt: "What is printed?",
    snippet: `#include <stdio.h>
int main() {
    int arr[] = {2, 4, 6, 8};
    int *p = arr + 1;
    printf("%d %d", *p, p[1]);
    return 0;
}`,
    options: ["2 4", "4 6", "4 4", "6 8"],
    correctIndex: 1,
    compilerOutput: "4 6",
    explanation: [
      { line: "int *p = arr + 1;", why: "Pointer arithmetic moves p to arr[1], which is 4." },
      { line: "*p", why: "Dereferencing p yields 4." },
      { line: "p[1]", why: "p[1] is *(p+1) = arr[2] = 6." },
    ],
  },
  {
    id: "c-3",
    track: "c-pointers",
    language: "c",
    prompt: "What does this print?",
    snippet: `#include <stdio.h>
void bump(int *x) { *x = *x + 1; }
int main() {
    int n = 7;
    bump(&n);
    printf("%d", n);
    return 0;
}`,
    options: ["7", "8", "undefined", "compile error"],
    correctIndex: 1,
    compilerOutput: "8",
    explanation: [
      { line: "bump(&n);", why: "The function receives a pointer to n, not a copy of 7." },
      { line: "*x = *x + 1;", why: "The pointed-to integer is incremented in place." },
      { line: "printf", why: "n in main is now 8." },
    ],
  },
  {
    id: "c-4",
    track: "c-pointers",
    language: "c",
    prompt: "What is printed?",
    snippet: `#include <stdio.h>
int main() {
    char s[] = "RBIT";
    char *p = s;
    printf("%c%c", *p + 1, *(p + 1));
    return 0;
}`,
    options: ["RS", "SB", "RB", "compile error"],
    correctIndex: 1,
    compilerOutput: "SB",
    explanation: [
      { line: "*p + 1", why: "s[0] is 'R'. Adding 1 to the char value yields 'S'." },
      { line: "*(p + 1)", why: "This is s[1], the character 'B'." },
      { line: "printf", why: "No extra spaces: SB." },
    ],
  },
  {
    id: "c-5",
    track: "c-pointers",
    language: "c",
    prompt: "What is printed?",
    snippet: `#include <stdio.h>
int main() {
    int a = 3, b = 9;
    int *p = &a;
    int **pp = &p;
    *pp = &b;
    printf("%d", *p);
    return 0;
}`,
    options: ["3", "9", "address", "undefined"],
    correctIndex: 1,
    compilerOutput: "9",
    explanation: [
      { line: "int **pp = &p;", why: "pp points at the pointer variable p." },
      { line: "*pp = &b;", why: "This retargets p so it now points at b." },
      { line: "*p", why: "p now aliases b, so *p is 9." },
    ],
  },
  {
    id: "j-1",
    track: "java-poly",
    language: "java",
    prompt: "What is printed?",
    snippet: `class A { void show() { System.out.print("A"); } }
class B extends A { void show() { System.out.print("B"); } }
class Main {
  public static void main(String[] args) {
    A x = new B();
    x.show();
  }
}`,
    options: ["A", "B", "AB", "compile error"],
    correctIndex: 1,
    compilerOutput: "B",
    explanation: [
      { line: "A x = new B();", why: "Compile-time type is A, runtime object is B." },
      { line: "x.show();", why: "Instance methods are dispatched on the runtime type." },
      { line: "B.show()", why: "Override in B runs, printing B." },
    ],
  },
  {
    id: "j-2",
    track: "java-poly",
    language: "java",
    prompt: "What is printed?",
    snippet: `class A {
  static void ping() { System.out.print("A"); }
}
class B extends A {
  static void ping() { System.out.print("B"); }
}
class Main {
  public static void main(String[] args) {
    A x = new B();
    x.ping();
  }
}`,
    options: ["A", "B", "AB", "runtime error"],
    correctIndex: 0,
    compilerOutput: "A",
    explanation: [
      { line: "static void ping()", why: "Static methods are resolved on the compile-time type." },
      { line: "A x = new B();", why: "x is typed as A, so A.ping() is chosen." },
      { line: "hiding vs override", why: "B.ping hides A.ping; it does not override it." },
    ],
  },
  {
    id: "j-3",
    track: "java-poly",
    language: "java",
    prompt: "What is printed?",
    snippet: `class A {
  A() { System.out.print("A"); }
}
class B extends A {
  B() { System.out.print("B"); }
}
class Main {
  public static void main(String[] args) {
    new B();
  }
}`,
    options: ["B", "A", "AB", "BA"],
    correctIndex: 2,
    compilerOutput: "AB",
    explanation: [
      { line: "new B()", why: "Subclass constructor starts, then implicitly calls super()." },
      { line: "A()", why: "The superclass constructor runs first and prints A." },
      { line: "B()", why: "Then the subclass body prints B." },
    ],
  },
  {
    id: "j-4",
    track: "java-poly",
    language: "java",
    prompt: "What is printed?",
    snippet: `class A {
  void go(int n) { System.out.print("int"); }
  void go(Integer n) { System.out.print("Integer"); }
}
class Main {
  public static void main(String[] args) {
    new A().go(3);
  }
}`,
    options: ["int", "Integer", "compile error", "both"],
    correctIndex: 0,
    compilerOutput: "int",
    explanation: [
      { line: "go(3)", why: "3 is a primitive int literal." },
      { line: "overload resolution", why: "The exact primitive match wins over boxing to Integer." },
      { line: "output", why: "The int overload prints int." },
    ],
  },
  {
    id: "j-5",
    track: "java-poly",
    language: "java",
    prompt: "What is printed?",
    snippet: `interface Speak {
  default void hi() { System.out.print("I"); }
}
class Dog implements Speak {
  public void hi() { System.out.print("D"); }
}
class Main {
  public static void main(String[] args) {
    Speak s = new Dog();
    s.hi();
  }
}`,
    options: ["I", "D", "ID", "compile error"],
    correctIndex: 1,
    compilerOutput: "D",
    explanation: [
      { line: "Speak s = new Dog();", why: "Interface reference, Dog instance." },
      { line: "Dog.hi()", why: "The class override replaces the default method." },
      { line: "s.hi()", why: "Runtime dispatch prints D." },
    ],
  },
  {
    id: "p-1",
    track: "python-scope",
    language: "python",
    prompt: "What is printed?",
    snippet: `funcs = []
for i in range(3):
    funcs.append(lambda: i)
print([f() for f in funcs])`,
    options: ["[0, 1, 2]", "[2, 2, 2]", "[3, 3, 3]", "error"],
    correctIndex: 1,
    compilerOutput: "[2, 2, 2]",
    explanation: [
      { line: "lambda: i", why: "The lambda captures the name i, not the value at creation time." },
      { line: "after the loop", why: "i remains 2 (the last range value)." },
      { line: "each f()", why: "Every call looks up the same i, so [2, 2, 2]." },
    ],
  },
  {
    id: "p-2",
    track: "python-scope",
    language: "python",
    prompt: "What is printed?",
    snippet: `x = 1
def f():
    x = 2
    def g():
        print(x)
    g()
f()`,
    options: ["1", "2", "UnboundLocalError", "None"],
    correctIndex: 1,
    compilerOutput: "2",
    explanation: [
      { line: "x = 2 in f", why: "g is nested inside f, so LEGB finds f's local x first." },
      { line: "print(x)", why: "No assignment in g, so it reads the enclosing x." },
      { line: "global x", why: "The module-level 1 is shadowed and unused." },
    ],
  },
  {
    id: "p-3",
    track: "python-scope",
    language: "python",
    prompt: "What is printed?",
    snippet: `def gen():
    yield 1
    yield 2
    return 3
g = gen()
print(next(g), next(g))`,
    options: ["1 2", "1 3", "2 3", "StopIteration"],
    correctIndex: 0,
    compilerOutput: "1 2",
    explanation: [
      { line: "yield 1 / yield 2", why: "The first two next() calls produce 1 then 2." },
      { line: "return 3", why: "The return value is the StopIteration payload, not a yielded item." },
      { line: "print", why: "Only the two yielded values are printed." },
    ],
  },
  {
    id: "p-4",
    track: "python-scope",
    language: "python",
    prompt: "What is printed?",
    snippet: `def add(item, bag=[]):
    bag.append(item)
    return bag
print(add(1), add(2))`,
    options: ["[1] [2]", "[1] [1, 2]", "[1, 2] [1, 2]", "error"],
    correctIndex: 2,
    compilerOutput: "[1, 2] [1, 2]",
    explanation: [
      { line: "bag=[]", why: "The default list is created once, when the function is defined." },
      { line: "add(1)", why: "Mutates that shared list to [1]." },
      { line: "add(2)", why: "Appends to the same list; both prints show [1, 2]." },
    ],
  },
  {
    id: "p-5",
    track: "python-scope",
    language: "python",
    prompt: "What is printed?",
    snippet: `def count_up():
    n = 0
    while True:
        n += 1
        yield n
c = count_up()
print(next(c), next(c), next(c))`,
    options: ["1 1 1", "0 1 2", "1 2 3", "infinite loop"],
    correctIndex: 2,
    compilerOutput: "1 2 3",
    explanation: [
      { line: "n += 1; yield n", why: "Each resume continues after yield with n preserved." },
      { line: "three next() calls", why: "Produces 1, then 2, then 3." },
      { line: "while True", why: "The generator is lazy; it does not loop forever until pulled." },
    ],
  },
  {
    id: "js-1",
    track: "js-event-loop",
    language: "javascript",
    prompt: "What is logged?",
    snippet: `console.log("a");
setTimeout(() => console.log("b"), 0);
Promise.resolve().then(() => console.log("c"));
console.log("d");`,
    options: ["a b c d", "a d c b", "a d b c", "a c d b"],
    correctIndex: 1,
    compilerOutput: "a\nd\nc\nb",
    explanation: [
      { line: "console.log a / d", why: "Synchronous logs run first: a then d." },
      { line: "Promise.then", why: "Microtasks run before the next macrotask." },
      { line: "setTimeout 0", why: "Timers are macrotasks, so b comes last." },
    ],
  },
  {
    id: "js-2",
    track: "js-event-loop",
    language: "javascript",
    prompt: "What is logged?",
    snippet: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    options: ["0 1 2", "1 2 3", "3 3 3", "undefined x3"],
    correctIndex: 2,
    compilerOutput: "3\n3\n3",
    explanation: [
      { line: "var i", why: "var is function-scoped; all timeouts close over one i." },
      { line: "after the loop", why: "i is 3 when the callbacks run." },
      { line: "let would differ", why: "let would create a binding per iteration." },
    ],
  },
  {
    id: "js-3",
    track: "js-event-loop",
    language: "javascript",
    prompt: "What is logged?",
    snippet: `async function run() {
  console.log("1");
  await Promise.resolve();
  console.log("2");
}
console.log("0");
run();
console.log("3");`,
    options: ["0 1 2 3", "0 1 3 2", "1 0 3 2", "0 1 2 3 (await blocks)"],
    correctIndex: 1,
    compilerOutput: "0\n1\n3\n2",
    explanation: [
      { line: "console.log 0; run()", why: "run starts immediately after 0." },
      { line: "await", why: "Pauses run; the remainder becomes a microtask." },
      { line: "console.log 3", why: "The caller continues, so 3 prints before 2." },
    ],
  },
  {
    id: "js-4",
    track: "js-event-loop",
    language: "javascript",
    prompt: "What is logged?",
    snippet: `queueMicrotask(() => console.log("micro"));
setTimeout(() => console.log("macro"), 0);
console.log("sync");`,
    options: ["micro macro sync", "sync micro macro", "sync macro micro", "micro sync macro"],
    correctIndex: 1,
    compilerOutput: "sync\nmicro\nmacro",
    explanation: [
      { line: "console.log sync", why: "Current call stack always finishes first." },
      { line: "queueMicrotask", why: "Drains before the timer queue." },
      { line: "setTimeout", why: "Macrotask runs after microtasks." },
    ],
  },
  {
    id: "js-5",
    track: "js-event-loop",
    language: "javascript",
    prompt: "What is logged?",
    snippet: `const obj = {
  n: 1,
  get: function () { return this.n; }
};
const g = obj.get;
console.log(obj.get(), g());`,
    options: ["1 1", "1 undefined", "undefined 1", "TypeError"],
    correctIndex: 1,
    compilerOutput: "1 undefined",
    explanation: [
      { line: "obj.get()", why: "Method call binds this to obj, so n is 1." },
      { line: "const g = obj.get", why: "The function is detached from obj." },
      { line: "g()", why: "this is undefined in strict modules, so this.n is undefined." },
    ],
  },
];

export function questionsForTrack(track: TrackId): Question[] {
  return QUESTIONS.filter((q) => q.track === track);
}

export function dailyQuestions(date = new Date()): Question[] {
  const seed =
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate();
  const shuffled = [...QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 3) * 1103515245 + 12345) % (i + 1);
    const abs = ((j % (i + 1)) + (i + 1)) % (i + 1);
    [shuffled[i], shuffled[abs]] = [shuffled[abs], shuffled[i]];
  }
  return shuffled.slice(0, 5);
}

export function trackById(id: TrackId) {
  return TRACKS.find((t) => t.id === id)!;
}
