import React, { useMemo, useState } from 'react';
import styles from './ResearchQuestion.module.css';

type Point = {
  title: string;
  body: string;
};

type CodeEntry = {
  path: string;
  note: string;
};

type Tradeoff = {
  gain: string;
  cost: string;
};

type ResearchQuestionProps = {
  number: string;
  originalQuestion: string;
  theme: string;
  thesis: string;
  stakes: string;
  tension: {
    left: string;
    right: string;
    verdict: string;
  };
  mechanisms: Point[];
  tradeoffs: Tradeoff[];
  evidence: CodeEntry[];
  followups: string[];
};

const tabs = [
  { id: 'judgment', label: '判断' },
  { id: 'mechanism', label: '机制' },
  { id: 'evidence', label: '证据' },
  { id: 'questions', label: '追问' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function ResearchQuestion({
  number,
  originalQuestion,
  theme,
  thesis,
  stakes,
  tension,
  mechanisms,
  tradeoffs,
  evidence,
  followups,
}: ResearchQuestionProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('judgment');
  const progress = useMemo(() => {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    return `${(index / Math.max(tabs.length - 1, 1)) * 100}%`;
  }, [activeTab]);

  return (
    <article className={styles.chapterShell}>
      <header className={styles.hero}>
        <div className={styles.issueNumber}>Question {number}</div>
        <p className={styles.theme}>{theme}</p>
      </header>

      <section className={styles.originalQuestion} aria-label="原始问题">
        <div className={styles.sectionLabel}>原始问题</div>
        <blockquote>{originalQuestion}</blockquote>
      </section>

      <section className={styles.thesisGrid} aria-label="核心判断">
        <div className={styles.thesisCard}>
          <div className={styles.sectionLabel}>核心判断</div>
          <p>{thesis}</p>
        </div>
        <div className={styles.thesisCard}>
          <div className={styles.sectionLabel}>为什么重要</div>
          <p>{stakes}</p>
        </div>
      </section>

      <section className={styles.tensionPanel} aria-label="架构张力">
        <div>
          <div className={styles.sectionLabel}>张力 A</div>
          <p>{tension.left}</p>
        </div>
        <div className={styles.tensionDivider}>vs</div>
        <div>
          <div className={styles.sectionLabel}>张力 B</div>
          <p>{tension.right}</p>
        </div>
        <div className={styles.verdict}>
          <span>取舍结论</span>
          <p>{tension.verdict}</p>
        </div>
      </section>

      <section className={styles.interactivePanel} aria-label="交互式研究视图">
        <div className={styles.tabRail}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? styles.activeTab : undefined}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <div className={styles.progressTrack}>
            <span style={{ width: progress }} />
          </div>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'judgment' && (
            <div className={styles.tradeoffGrid}>
              {tradeoffs.map((tradeoff, index) => (
                <div className={styles.tradeoffCard} key={`${tradeoff.gain}-${index}`}>
                  <div>
                    <span>得到</span>
                    <p>{tradeoff.gain}</p>
                  </div>
                  <div>
                    <span>付出</span>
                    <p>{tradeoff.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mechanism' && (
            <div className={styles.mechanismList}>
              {mechanisms.map((item, index) => (
                <details key={`${item.title}-${index}`} open={index === 0}>
                  <summary>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item.title}
                  </summary>
                  <p>{item.body}</p>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className={styles.evidenceList}>
              {evidence.map((entry) => (
                <div className={styles.evidenceRow} key={entry.path}>
                  <code>{entry.path}</code>
                  <p>{entry.note}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'questions' && (
            <ol className={styles.followupList}>
              {followups.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </article>
  );
}
