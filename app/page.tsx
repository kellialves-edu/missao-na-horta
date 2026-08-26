'use client';

import { useMemo, useState } from 'react';

type Question = { id:number; category:string; icon:string; prompt:string; options:string[]; answer:string; tip:string };
type Result = { id:number; name:string; score:number; total:number; createdAt:string };

const questions: Question[] = [
  { id:1, category:'Partes da planta', icon:'🌱', prompt:'Qual parte da planta fica embaixo da terra?', options:['Folha','Raiz','Flor'], answer:'Raiz', tip:'A raiz fixa a planta no solo.' },
  { id:2, category:'Partes da planta', icon:'🌿', prompt:'Qual parte sustenta folhas, flores e frutos?', options:['Caule','Semente','Raiz'], answer:'Caule', tip:'O caule também transporta água para as folhas.' },
  { id:3, category:'Partes da planta', icon:'🌼', prompt:'Qual parte da planta pode produzir sementes?', options:['Flor','Raiz','Caule'], answer:'Flor', tip:'A flor participa da reprodução da planta.' },
  { id:4, category:'Partes da planta', icon:'🍅', prompt:'Qual parte protege as sementes?', options:['Fruto','Folha','Solo'], answer:'Fruto', tip:'Muitos frutos guardam sementes em seu interior.' },
  { id:5, category:'Partes da planta', icon:'☀️', prompt:'Onde a planta realiza a fotossíntese?', options:['Na folha','Na raiz','Na semente'], answer:'Na folha', tip:'As folhas usam a luz para produzir alimento.' },
  { id:6, category:'Origem dos alimentos', icon:'🥛', prompt:'De onde vem o leite?', options:['Origem animal','Origem vegetal','Origem mineral'], answer:'Origem animal', tip:'O leite é produzido por animais, como a vaca.' },
  { id:7, category:'Origem dos alimentos', icon:'🍌', prompt:'A banana é um alimento de qual origem?', options:['Animal','Vegetal','Industrial'], answer:'Vegetal', tip:'A banana nasce de uma planta.' },
  { id:8, category:'Origem dos alimentos', icon:'🍯', prompt:'Qual animal produz o mel?', options:['Galinha','Abelha','Vaca'], answer:'Abelha', tip:'As abelhas produzem o mel.' },
  { id:9, category:'Origem dos alimentos', icon:'🥕', prompt:'Qual destes cresce embaixo da terra?', options:['Cenoura','Maçã','Alface'], answer:'Cenoura', tip:'A parte que comemos da cenoura cresce no solo.' },
  { id:10, category:'Origem dos alimentos', icon:'🧀', prompt:'O queijo é um alimento de qual origem?', options:['Animal','Vegetal','Mineral'], answer:'Animal', tip:'O queijo é feito com leite.' },
  { id:11, category:'Natural ou industrializado', icon:'🍎', prompt:'A maçã é um alimento...', options:['Natural','Industrializado','Artificial'], answer:'Natural', tip:'Ela pode ser colhida diretamente da natureza.' },
  { id:12, category:'Natural ou industrializado', icon:'🥤', prompt:'O refrigerante é um alimento...', options:['Natural','Industrializado','Vegetal'], answer:'Industrializado', tip:'Ele passa por processos em uma fábrica.' },
  { id:13, category:'Natural ou industrializado', icon:'🍊', prompt:'Qual destes é natural?', options:['Laranja','Biscoito','Salgadinho'], answer:'Laranja', tip:'A laranja vem diretamente de uma planta.' },
  { id:14, category:'Natural ou industrializado', icon:'🍞', prompt:'O pão é natural ou industrializado?', options:['Natural','Industrializado','Mineral'], answer:'Industrializado', tip:'O pão é preparado com ingredientes transformados.' },
  { id:15, category:'Alimentação saudável', icon:'🍏', prompt:'Na hora do lanche, qual é a opção mais saudável?', options:['Maçã','Bala','Refrigerante'], answer:'Maçã', tip:'Frutas são boas escolhas para o lanche.' },
];
const shuffle = <T,>(items:T[]) => [...items].sort(() => Math.random() - .5);

export default function Home() {
  const [screen,setScreen] = useState<'start'|'game'|'finish'|'teacher'>('start');
  const [name,setName] = useState('');
  const [round,setRound] = useState<Question[]>(questions.slice(0,10));
  const [index,setIndex] = useState(0);
  const [selected,setSelected] = useState<string|null>(null);
  const [score,setScore] = useState(0);
  const [answers,setAnswers] = useState<{questionId:number;answer:string;correct:boolean}[]>([]);
  const [results,setResults] = useState<Result[]>([]);
  const [loadingResults,setLoadingResults] = useState(false);
  const current = round[index];
  const progress = ((index + (selected ? 1 : 0)) / round.length) * 100;
  const firstName = useMemo(() => name.trim().split(/\s+/)[0] || 'Jardineiro', [name]);

  function startGame() {
    if (!name.trim()) return;
    setRound(shuffle(questions).slice(0,10).map(q => ({...q,options:shuffle(q.options)})));
    setIndex(0); setScore(0); setAnswers([]); setSelected(null); setScreen('game');
  }
  function choose(option:string) {
    if (selected) return;
    const correct = option === current.answer;
    setSelected(option); if (correct) setScore(v => v + 1);
    setAnswers(v => [...v,{questionId:current.id,answer:option,correct}]);
  }
  async function next() {
    if (index < round.length - 1) { setIndex(v => v + 1); setSelected(null); return; }
    setScreen('finish');
    await fetch('/api/results',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:name.trim(),score,total:round.length,answers})});
  }
  async function openTeacher() {
    setScreen('teacher'); setLoadingResults(true);
    try { const response=await fetch('/api/results'); const data=await response.json() as {results?:Result[]}; setResults(data.results||[]); }
    finally { setLoadingResults(false); }
  }

  return <main className="site-shell">
    <div className="sun sun-one"/><div className="sun sun-two"/>
    <header className="topbar">
      <button className="brand" onClick={() => setScreen('start')} aria-label="Voltar ao início"><span>🌱</span> Missão na Horta</button>
      <button className="teacher-link" onClick={openTeacher}>📊 Resultados da turma</button>
    </header>

    {screen==='start' && <section className="card start-card">
      <div className="hero-icon" aria-hidden="true">🧺</div><p className="eyebrow">Ciências • 3º ano</p>
      <h1>Pronto para uma<br/><span>missão na horta?</span></h1>
      <p className="intro">Responda a 10 perguntas sobre plantas e alimentos. Cada acerto faz nossa horta florescer!</p>
      <label className="name-field">Seu nome<input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&startGame()} placeholder="Digite seu nome" maxLength={40} autoComplete="name"/></label>
      <button className="primary" onClick={startGame} disabled={!name.trim()}>Começar a missão <span>→</span></button>
      <div className="facts"><span>🎯 10 perguntas</span><span>⏱️ Cerca de 5 minutos</span><span>🏆 Resultado registrado</span></div>
    </section>}

    {screen==='game' && current && <section className="game-wrap">
      <div className="game-head"><div><strong>Olá, {firstName}!</strong><span>Questão {index+1} de {round.length}</span></div><div className="score-pill">⭐ {score} acerto{score===1?'':'s'}</div></div>
      <div className="progress"><span style={{width:`${progress}%`}}/></div>
      <article className="card question-card">
        <div className="category"><span>{current.icon}</span>{current.category}</div><h2>{current.prompt}</h2>
        <div className="options">{current.options.map((option,i)=>{const state=selected?(option===current.answer?'correct':option===selected?'wrong':'muted'):'';return <button key={option} className={state} onClick={()=>choose(option)} disabled={!!selected}><b>{String.fromCharCode(65+i)}</b>{option}<i>{state==='correct'?'✓':state==='wrong'?'×':''}</i></button>})}</div>
        {selected && <div className={`feedback ${selected===current.answer?'yay':'try'}`}><strong>{selected===current.answer?'🎉 Muito bem!':'🌻 Quase lá!'}</strong><span>{current.tip}</span></div>}
        {selected && <button className="primary next" onClick={next}>{index===round.length-1?'Ver meu resultado':'Próxima pergunta'} <span>→</span></button>}
      </article>
    </section>}

    {screen==='finish' && <section className="card finish-card"><div className="hero-icon">🏆</div><p className="eyebrow">Missão cumprida!</p><h1>Parabéns, <span>{firstName}!</span></h1><div className="big-score"><strong>{score}</strong><span>de {round.length}<br/>respostas corretas</span></div><p>{score>=8?'Sua horta está cheia de conhecimento!':'Cada tentativa faz o conhecimento crescer. Continue praticando!'}</p><button className="primary" onClick={startGame}>Jogar novamente ↻</button></section>}

    {screen==='teacher' && <section className="card teacher-card">
      <div className="teacher-title"><div><p className="eyebrow">Acompanhamento</p><h1>Resultados da turma</h1></div><button onClick={()=>setScreen('start')}>Fechar ×</button></div>
      <p className="teacher-note">As tentativas mais recentes aparecem primeiro. A atividade comporta toda a turma.</p>
      {loadingResults?<div className="empty">Carregando resultados...</div>:results.length===0?<div className="empty">🌱 Os resultados aparecerão aqui depois da primeira partida.</div>:<div className="result-list"><div className="result-row heading"><span>Aluno</span><span>Acertos</span><span>Data</span></div>{results.map(r=><div className="result-row" key={r.id}><strong>{r.name}</strong><span><b>{r.score}</b> / {r.total}</span><time>{new Date(r.createdAt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</time></div>)}</div>}
    </section>}
    <footer>Conteúdo adaptado do material pedagógico “Missão na Horta”.</footer>
  </main>;
}
