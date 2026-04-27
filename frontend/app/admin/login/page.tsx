import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const TEAL = "#1db8a6";

const ERRORS: Record<string, string> = {
  empty:   "Введите логин и пароль",
  invalid: "Неверный логин или пароль",
  network: "Не удалось подключиться к серверу",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  if (cookieStore.has("admin_session")) {
    redirect("/admin");
  }

  const { error } = await searchParams;
  const errorMsg = error ? ERRORS[error] ?? "Ошибка входа" : "";

  const input: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: 12,
    color: "#fff",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    fontFamily: '"BerlinType", sans-serif',
    outline: "none",
    boxSizing: "border-box",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontFamily: '"BerlinType", sans-serif',
    color: "rgba(255,255,255,0.4)",
    fontSize: "0.68rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.35rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "rgba(7,56,53,0.92)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "2.5rem 2rem",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            fontFamily: '"Borsok", sans-serif',
            color: "#fff",
            fontSize: "1.6rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            margin: "0 0 0.4rem",
          }}
        >
          Romanov Records
        </h1>
        <p
          style={{
            fontFamily: '"BerlinType", sans-serif',
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.85rem",
            margin: "0 0 2rem",
          }}
        >
          Панель администратора
        </p>

        <form
          action="/api/admin/login"
          method="post"
          style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
        >
          <div>
            <label style={lbl}>Логин</label>
            <input
              type="text"
              name="login"
              placeholder="Введите логин"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              style={input}
            />
          </div>

          <div>
            <label style={lbl}>Пароль</label>
            <input
              type="password"
              name="password"
              placeholder="Введите пароль"
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              style={input}
            />
          </div>

          {errorMsg && (
            <p
              style={{
                fontFamily: '"BerlinType", sans-serif',
                color: "#f87171",
                fontSize: "0.85rem",
                margin: 0,
                textAlign: "center",
              }}
            >
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            style={{
              background: TEAL,
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontFamily: '"Borsok", sans-serif',
              fontSize: "1rem",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              padding: "0.85rem",
              cursor: "pointer",
              marginTop: "0.25rem",
            }}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
