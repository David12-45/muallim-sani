import React from 'react';
import { analyzeArabicWord } from '../services/wordAnalyzer';

export default function TajweedWordText({ word, highlightTajweed = true, isActive = false }) {
  if (!highlightTajweed || isActive) {
    return <span>{word}</span>;
  }

  // Если это составное выражение с пробелом (например в уроке Идгам), разбираем по словам
  if (String(word).includes(' ')) {
    const parts = String(word).split(' ');
    return (
      <span>
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            <TajweedWordText word={p} highlightTajweed={highlightTajweed} isActive={isActive} />
            {idx < parts.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </span>
    );
  }

  const analysis = analyzeArabicWord(word);

  // Если в слове нет специальных правил таджвида, возвращаем как единую строку
  if (analysis.activeRules.length === 0) {
    return <span>{word}</span>;
  }

  return (
    <span>
      {analysis.letters.map((l, idx) => {
        if (!l.tajweedMeta) {
          return <React.Fragment key={idx}>{l.joinedCluster}</React.Fragment>;
        }
        return (
          <span key={idx} className={l.tajweedMeta.textClass}>
            {l.joinedCluster}
          </span>
        );
      })}
    </span>
  );
}
