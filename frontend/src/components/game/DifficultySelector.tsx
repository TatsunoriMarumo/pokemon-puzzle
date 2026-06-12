import { t } from "../../lang";
import { DIFFICULTIES, type Difficulty } from "../../types/puzzle";
import { Button } from "../common/Button";

type Props = {
  difficulty: Difficulty;
  onChangeDifficulty: (difficulty: Difficulty) => void;
};

export function DifficultySelector({ difficulty, onChangeDifficulty }: Props) {
  return (
    <div className="flex justify-center gap-2">
      {DIFFICULTIES.map((difficultyKey) => (
        <Button
          key={difficultyKey}
          isActive={difficulty === difficultyKey}
          onClick={() => onChangeDifficulty(difficultyKey)}
        >
          {t.difficulty[difficultyKey]}
        </Button>
      ))}
    </div>
  );
}
