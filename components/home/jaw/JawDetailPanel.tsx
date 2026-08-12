"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { useRef, type JSX } from "react";
import type { JawProblem, JawSolution, JawZone } from "./jawContent";
import { JawAppointmentForm } from "./JawAppointmentForm";
import styles from "./jawExperience.module.css";

export type JawDetailPanelProps = {
  zone: JawZone;
  portalContainer: HTMLElement | null;
  activeProblemId: string | null;
  activeSolutionId: string | null;
  onProblemSelect(id: string): void;
  onSolutionSelect(id: string): void;
  onBack(): void;
  onClose(): void;
};

const PRICE_LIST_URL = "https://www.bratislavazubar.sk/cennik/";

function formatPrice(solution: JawSolution): string | null {
  if (!solution.price) return null;
  return `${solution.price.from ? "od " : ""}${solution.price.amount} €`;
}

export function JawDetailPanel({
  zone,
  portalContainer,
  activeProblemId,
  activeSolutionId,
  onProblemSelect,
  onSolutionSelect,
  onBack,
  onClose,
}: JawDetailPanelProps): JSX.Element | null {
  const firstProblemRef = useRef<HTMLButtonElement>(null);
  const activeProblem: JawProblem | undefined = zone.problems.find(
    (problem) => problem.id === activeProblemId,
  );
  const activeSolution: JawSolution | undefined = activeProblem?.solutions.find(
    (solution) => solution.id === activeSolutionId,
  );

  if (!portalContainer) return null;

  return (
    <Dialog.Root
      open
      modal
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal container={portalContainer}>
        <Dialog.Overlay className={styles.detailOverlay} />
        <Dialog.Content
          className={styles.detailPanel}
          onOpenAutoFocus={(event) => {
            if (!activeProblem) {
              event.preventDefault();
              firstProblemRef.current?.focus();
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          <header className={styles.detailHeader}>
            {activeProblem ? (
              <button
                type="button"
                className={styles.backButton}
                onClick={onBack}
              >
                <IconArrowLeft aria-hidden="true" />
                Späť
              </button>
            ) : (
              <span className={styles.detailEyebrow}>Vyberte, čo vás trápi</span>
            )}
            <Dialog.Close asChild>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Zavrieť detail"
              >
                <IconX aria-hidden="true" />
              </button>
            </Dialog.Close>
          </header>

          <div className={styles.detailScroll}>
            <Dialog.Title className={styles.detailTitle}>
              {activeSolution?.label ?? activeProblem?.label ?? zone.label}
            </Dialog.Title>

            {activeSolution && activeProblem ? (
              <SolutionDetail
                zone={zone}
                problem={activeProblem}
                solution={activeSolution}
              />
            ) : activeProblem ? (
              <SolutionChoices
                problem={activeProblem}
                onSolutionSelect={onSolutionSelect}
              />
            ) : (
              <ProblemChoices
                problems={zone.problems}
                firstProblemRef={firstProblemRef}
                onProblemSelect={onProblemSelect}
              />
            )}

            <Dialog.Description className={styles.medicalNotice}>
              Táto orientačná pomôcka nenahrádza vyšetrenie ani diagnózu lekára.
            </Dialog.Description>
            <a
              className={styles.priceLink}
              href={PRICE_LIST_URL}
              target="_blank"
              rel="noreferrer"
            >
              Pozrieť oficiálny cenník
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type ProblemChoicesProps = {
  problems: readonly JawProblem[];
  firstProblemRef: React.RefObject<HTMLButtonElement | null>;
  onProblemSelect(id: string): void;
};

function ProblemChoices({
  problems,
  firstProblemRef,
  onProblemSelect,
}: ProblemChoicesProps): JSX.Element {
  return (
    <div className={styles.choiceList}>
      {problems.map((problem, index) => (
        <button
          key={problem.id}
          ref={index === 0 ? firstProblemRef : undefined}
          type="button"
          className={styles.choiceButton}
          onClick={() => onProblemSelect(problem.id)}
        >
          {problem.label}
        </button>
      ))}
    </div>
  );
}

function SolutionChoices({
  problem,
  onSolutionSelect,
}: {
  problem: JawProblem;
  onSolutionSelect(id: string): void;
}): JSX.Element {
  return (
    <>
      <p className={styles.detailCopy}>{problem.shortMeaning}</p>
      <div className={styles.choiceList}>
        {problem.solutions.map((solution) => (
          <button
            key={solution.id}
            type="button"
            className={styles.choiceButton}
            onClick={() => onSolutionSelect(solution.id)}
          >
            {solution.label}
          </button>
        ))}
      </div>
    </>
  );
}

function SolutionDetail({
  zone,
  problem,
  solution,
}: {
  zone: JawZone;
  problem: JawProblem;
  solution: JawSolution;
}): JSX.Element {
  const price = formatPrice(solution);

  return (
    <>
      <p className={styles.detailCopy}>{solution.explanation}</p>
      <dl className={styles.solutionFacts}>
        {price ? (
          <div>
            <dt>Orientačná cena</dt>
            <dd>{price}</dd>
          </div>
        ) : null}
        <div>
          <dt>Trvanie</dt>
          <dd>{solution.duration}</dd>
        </div>
      </dl>
      <JawAppointmentForm
        selection={{
          zoneId: zone.id,
          problemId: problem.id,
          solutionId: solution.id,
        }}
      />
    </>
  );
}
