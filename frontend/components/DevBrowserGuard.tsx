const DEV_BROWSER_GUARD = `
(() => {
  const isInjectedEthereumError = (message) =>
    typeof message === "string" &&
    message.includes("window.ethereum.selectedAddress") &&
    message.includes("undefined");

  window.addEventListener("error", (event) => {
    if (isInjectedEthereumError(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = reason && (reason.message || String(reason));
    if (isInjectedEthereumError(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  if (!window.ethereum) {
    Object.defineProperty(window, "ethereum", {
      value: { selectedAddress: undefined },
      writable: true,
      configurable: true,
    });
  }
})();
`;

export default function DevBrowserGuard() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <script
      async
      id="dev-browser-guard"
      dangerouslySetInnerHTML={{ __html: DEV_BROWSER_GUARD }}
    />
  );
}
