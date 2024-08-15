import { useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { useAuthInfo, useHostedPageUrls, useLogoutFunction } from "@propelauth/react";
import ky from "ky";

function App() {
  const [count, setCount] = useState(0);
  const { accessToken } = useAuthInfo();
  const logOut = useLogoutFunction();
  const { getLoginPageUrl } = useHostedPageUrls();
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          type="button"
          onClick={() => {
            logOut(false);
          }}
        >
          Log Out
        </button>
        <button
          type="button"
          onClick={async () => {
            await ky
              .post("/api/auth/session", { headers: { authorization: `Bearer ${accessToken}` } })
              .json();
          }}
        >
          Set Session
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
