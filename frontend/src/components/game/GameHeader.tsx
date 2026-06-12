import { t } from "../../lang";

export function GameHeader() {
  return (
    <header className="text-center">
      <h1 className="text-4xl font-black text-slate-800">{t.app.title}</h1>
    </header>
  );
}
