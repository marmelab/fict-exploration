import { $state, render } from "fict";

export function Counter() {
  let count = $state(0);
  const doubled = count * 2; // auto-derived

  return (
    <div class="counter">
      <h1>Fict Counter</h1>
      <div class="card">
        <button onClick={() => count--}>-</button>
        <span class="count">{count}</span>
        <button onClick={() => count++}>+</button>
      </div>
      <p class="doubled">Doubled: {doubled}</p>
    </div>
  );
}

render(() => <Counter />, document.getElementById("app")!);
