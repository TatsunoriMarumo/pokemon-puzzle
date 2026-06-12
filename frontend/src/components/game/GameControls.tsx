import { t } from "../../lang";
import { Button } from "../common/Button";

type Props = {
  onReset: () => void;
  onNextPokemon: () => void;
};

export function GameControls({ onReset, onNextPokemon }: Props) {
  return (
    <div className="flex justify-center gap-3">
      <Button onClick={onReset}>{t.game.reset}</Button>
      <Button onClick={onNextPokemon}>{t.game.nextPokemon}</Button>
    </div>
  );
}
