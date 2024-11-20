import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [chips, setChips] = useState<number>(0);

  useEffect(() => {
    const userChips = localStorage.getItem("userChips");

    if (!userChips) {
      setStartingChips();
    } else {
      setChips(Number(userChips));
    }
  }, []);

  const setStartingChips = () => {
    setChips(500);
    localStorage.setItem("userChips", "500");
  };

  const bankUserChips = () => {
    localStorage.setItem("userChips", chips.toString());
  };
  return (
    <>
      <div>The user has {chips} chips</div>
      <button onClick={() => setChips(chips + 1)}>Add a chip</button>
      <button onClick={() => setChips(chips - 1)}>Remove a chip</button>
      <button onClick={bankUserChips}>Bank chips</button>
      <button onClick={() => localStorage.removeItem("userChips")}>
        Remove local storage chips
      </button>
    </>
  );
}

export default App;
