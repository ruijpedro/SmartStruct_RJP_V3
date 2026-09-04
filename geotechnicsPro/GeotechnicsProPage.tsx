import React,{useMemo,useState} from 'react'
import {EngineeringBasis,PreliminaryChecklist} from '../../engineering/EngineeringBasis'
import {correctSPT,estimatePhiFromSPT,cptBasic,bearingCapacityStrip,settlementElastic,waterPressure} from './GeotechnicsSolver'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
export default function GeotechnicsProPage(){
  const [tab,setTab]=useState<'spt'|'cpt'|'bearing'|'settlement'|'water'|'criteria'>('spt')
  const [N,setN]=useState(18),[qc,setQc]=useState(8),[fs,setFs]=useState(80)
  const [c,setC]=useState(10),[phi,setPhi]=useState(30),[gamma,setGamma]=useState(19),[B,setB]=useState(2),[D,setD]=useState(1)
  const [q,setQ]=useState(150),[E,setE]=useState(25000),[nu,setNu]=useState(.3),[hw,setHw]=useState(2)
  const spt=useMemo(()=>{const r=correctSPT(N);return {...r,phi:estimatePhiFromSPT(r.N60)}},[N])
  const cpt=useMemo(()=>cptBasic(qc,fs),[qc,fs])
  const bc=useMemo(()=>bearingCapacityStrip(c,phi,gamma,B,D),[c,phi,gamma,B,D])
  const set=useMemo(()=>settlementElastic(q,B,E,nu),[q,B,E,nu])
  const wp=useMemo(()=>waterPressure(9.81,hw),[hw])
  return <div className="module-page"><div className="module-head"><div><h2>Geotecnia</h2><p>SPT, CPT, capacidade de carga, assentamentos e água.</p></div></div>
    <div className="tabs-row">{[['spt','SPT'],['cpt','CPT'],['bearing','Capacidade'],['settlement','Assentamentos'],['water','Nível freático'],['criteria','Normas / Critérios']].map(([k,l])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k as any)}>{l}</button>)}</div>
    <div className="work-grid"><section className="panel"><h3>Dados</h3><div className="form-grid">
    {tab==='spt'&&<><F l="N" v={N} s={setN}/></>}
    {tab==='cpt'&&<><F l="qc" u="MPa" v={qc} s={setQc}/><F l="fs" u="kPa" v={fs} s={setFs}/></>}
    {tab==='bearing'&&<><F l="c'" u="kPa" v={c} s={setC}/><F l="φ'" u="°" v={phi} s={setPhi}/><F l="γ" u="kN/m³" v={gamma} s={setGamma}/><F l="B" u="m" v={B} s={setB}/><F l="D" u="m" v={D} s={setD}/></>}
    {tab==='settlement'&&<><F l="q" u="kPa" v={q} s={setQ}/><F l="B" u="m" v={B} s={setB}/><F l="E" u="kPa" v={E} s={setE}/><F l="ν" v={nu} s={setNu}/></>}
    {tab==='water'&&<><F l="Altura de água" u="m" v={hw} s={setHw}/></>}
    </div></section><section className="panel geo-visual-panel"><h3>Modelo geotécnico 3D</h3><Geo3DScene tab={tab} B={B} D={D} hw={hw}/></section></div><section className="panel"><h3>Resultados</h3><div className="result-grid compact">
    {tab==='spt'&&<><M t="N60" v={spt.N60.toFixed(1)}/><M t="φ estimado" v={`${spt.phi.toFixed(1)}°`}/></>}
    {tab==='cpt'&&<><M t="Rf" v={`${cpt.Rf.toFixed(2)} %`}/><M t="Solo" v={cpt.soil}/></>}
    {tab==='bearing'&&<><M t="Nc" v={bc.Nc.toFixed(1)}/><M t="Nq" v={bc.Nq.toFixed(1)}/><M t="Nγ" v={bc.Ng.toFixed(1)}/><M t="qult" v={`${bc.qult.toFixed(0)} kPa`}/></>}
    {tab==='settlement'&&<><M t="s" v={`${(set.s*1000).toFixed(1)} mm`}/></>}
    {tab==='water'&&<><M t="u" v={`${wp.toFixed(1)} kPa`}/></>}
    </div></section>
    {tab==='criteria'&&<><EngineeringBasis area="geotechnics"/><section className="panel"><h3>Checklist de estudo prévio geotécnico</h3><PreliminaryChecklist items={[{name:'Modelo geológico-geotécnico',status:'check',detail:'Definir estratigrafia, nível freático e variabilidade espacial.'},{name:'Reconhecimento / ensaios',status:'ok',detail:'A app integra interpretação preliminar SPT e CPT/CPTu.'},{name:'Parâmetros característicos',status:'check',detail:'Correlações devem ser confrontadas com ensaios laboratoriais e experiência local.'},{name:'Capacidade de carga',status:'ok',detail:'Pré-dimensionamento disponível; confirmar abordagem de projeto e fatores parciais.'},{name:'Assentamentos',status:'ok',detail:'Estimativa disponível; requer modelo de deformabilidade e sequência construtiva adequados.'},{name:'Estabilidade global / taludes',status:'check',detail:'Verificar cenários drenados/não drenados, água e ações sísmicas quando aplicável.'}]}/></section></>}
  </div>
}

function Geo3DScene({tab,B,D,hw}:{tab:string;B:number;D:number;hw:number}){const W=620,H=330,P=(x:number,y:number,z:number)=>({x:310+(x-y)*28,y:270-z*28-(x+y)*11}),poly=(pts:{x:number;y:number}[],c:string)=><polygon points={pts.map(p=>`${p.x},${p.y}`).join(' ')} className={c}/>;const ground=[P(-5,-4,0),P(5,-4,0),P(5,4,0),P(-5,4,0)];const water=[P(-5,-4,-hw),P(5,-4,-hw),P(5,4,-hw),P(-5,4,-hw)];const fb=Math.max(.8,Math.min(3,B));const footing=[P(-fb/2,-fb/2,-D),P(fb/2,-fb/2,-D),P(fb/2,fb/2,-D),P(-fb/2,fb/2,-D)];return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg geo-3d"><defs><linearGradient id="soil113" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7b6548"/><stop offset="1" stopColor="#3f3325"/></linearGradient></defs>{poly(ground,'geo-ground')}{tab==='water'&&poly(water,'geo-water')}{['bearing','settlement'].includes(tab)&&poly(footing,'geo-footing')}<line x1={P(-5,0,0).x} y1={P(-5,0,0).y} x2={P(5,0,0).x} y2={P(5,0,0).y} className="geo-section"/><g className="geo-bore"><line x1={P(0,0,0).x} y1={P(0,0,0).y} x2={P(0,0,-7).x} y2={P(0,0,-7).y}/><circle cx={P(0,0,-2).x} cy={P(0,0,-2).y} r="5"/><circle cx={P(0,0,-4).x} cy={P(0,0,-4).y} r="5"/></g><text x="18" y="28">Terreno / fundação · vista 3D conceptual</text><text x="18" y="48" className="muted-svg">{tab==='bearing'?'Capacidade de carga':tab==='settlement'?'Assentamentos':tab==='water'?'Nível freático':'Reconhecimento geotécnico'}</text></svg>}
