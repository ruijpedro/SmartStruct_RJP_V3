import type {BIMElement,BIMElementType,BIMMaterialRef,SmartStructBIMModel} from './model'

export interface BIMLibraryItem{
 id:string; name:string; category:string; type:BIMElementType; description:string;
 geometry:Record<string,string|number|boolean|null>; material:BIMMaterialRef; tags:string[]
}
const concrete=(grade='C30/37'):BIMMaterialRef=>({id:`MAT-CONC-${grade.replace('/','-')}`,name:`Betão ${grade}`,family:'Betão',properties:{grade}})
const steel=(grade='S275'):BIMMaterialRef=>({id:`MAT-STEEL-${grade}`,name:`Aço ${grade}`,family:'Aço estrutural',properties:{grade}})
const timber=(grade='C24'):BIMMaterialRef=>({id:`MAT-TIMBER-${grade}`,name:`Madeira ${grade}`,family:'Madeira estrutural',properties:{grade}})

export const BIM_LIBRARY:BIMLibraryItem[]=[
 {id:'rc-column-30x30',name:'Pilar BA 30×30',category:'Betão armado',type:'column',description:'Pilar retangular de referência para edifícios.',geometry:{length:3,b:.30,h:.30},material:concrete(),tags:['pilar','betão','edifício']},
 {id:'rc-column-30x50',name:'Pilar BA 30×50',category:'Betão armado',type:'column',description:'Pilar retangular para ações superiores.',geometry:{length:3,b:.30,h:.50},material:concrete(),tags:['pilar','betão']},
 {id:'rc-beam-25x50',name:'Viga BA 25×50',category:'Betão armado',type:'beam',description:'Viga retangular de referência.',geometry:{length:5,b:.25,h:.50,axis:'X'},material:concrete(),tags:['viga','betão']},
 {id:'rc-beam-30x60',name:'Viga BA 30×60',category:'Betão armado',type:'beam',description:'Viga retangular para vãos/cargas superiores.',geometry:{length:6,b:.30,h:.60,axis:'X'},material:concrete(),tags:['viga','betão']},
 {id:'rc-slab-18',name:'Laje maciça 18 cm',category:'Betão armado',type:'slab',description:'Painel de laje maciça.',geometry:{width:5,depth:5,thickness:.18},material:concrete(),tags:['laje','betão']},
 {id:'footing-180',name:'Sapata 1,80×1,80',category:'Fundações',type:'isolated_footing',description:'Sapata isolada de referência.',geometry:{width:1.8,depth:1.8,height:.50},material:concrete(),tags:['sapata','fundação']},
 {id:'strip-footing',name:'Sapata contínua',category:'Fundações',type:'strip_footing',description:'Fundação contínua sob parede/alinhamento.',geometry:{width:6,depth:1,height:.45},material:concrete(),tags:['sapata','contínua']},
 {id:'raft',name:'Ensoleiramento geral',category:'Fundações',type:'raft_foundation',description:'Laje de fundação / ensoleiramento geral.',geometry:{width:10,depth:8,height:.45},material:concrete(),tags:['ensoleiramento','fundação']},
 {id:'pile-600',name:'Estaca Ø600',category:'Fundações profundas',type:'pile',description:'Estaca circular representada por prisma equivalente.',geometry:{width:.60,depth:.60,height:12},material:concrete(),tags:['estaca','profunda']},
 {id:'rc-wall-20',name:'Parede BA 20 cm',category:'Elementos verticais',type:'wall',description:'Parede estrutural / núcleo.',geometry:{width:5,depth:.20,height:3},material:concrete(),tags:['parede','núcleo']},
 {id:'steel-beam',name:'Viga metálica IPE 300',category:'Aço',type:'beam',description:'Representação BIM simplificada de viga metálica.',geometry:{length:6,b:.15,h:.30,axis:'X',profile:'IPE 300'},material:steel(),tags:['aço','IPE','viga']},
 {id:'steel-column',name:'Pilar metálico HEB 240',category:'Aço',type:'column',description:'Representação BIM simplificada de pilar metálico.',geometry:{length:3,b:.24,h:.24,profile:'HEB 240'},material:steel(),tags:['aço','HEB','pilar']},
 {id:'timber-beam',name:'Viga madeira 12×36',category:'Madeira',type:'beam',description:'Viga de madeira maciça/lamelada genérica.',geometry:{length:5,b:.12,h:.36,axis:'X'},material:timber(),tags:['madeira','viga']},
 {id:'retaining-wall',name:'Muro de contenção',category:'Geotecnia',type:'wall',description:'Muro de contenção conceptual para coordenação BIM.',geometry:{width:8,depth:.35,height:4},material:concrete(),tags:['muro','contenção','geotecnia']},
]

export function addLibraryItemToModel(model:SmartStructBIMModel,item:BIMLibraryItem):SmartStructBIMModel{
 const n=model.elements.length+1
 const col=n%6,row=Math.floor(n/6)
 const base={x:col*2.2,y:row*2.2,z:0}
 const geometry={...item.geometry,...base}
 if(item.type==='isolated_footing'||item.type==='strip_footing'||item.type==='raft_foundation') geometry.z=-Number(item.geometry.height||.5)
 const el:BIMElement={id:`LIB-${item.id.toUpperCase()}-${n}`,name:item.name,discipline:item.category==='Geotecnia'?'geotechnics':'structures',type:item.type,level:item.category.includes('Fund')?'Fundação':'Piso 1',material:item.material,geometry,properties:{libraryId:item.id,libraryCategory:item.category,source:'Biblioteca BIM SmartStruct'},calculation:{module:'Biblioteca BIM',status:'check',results:{nota:'Elemento inserido a partir da biblioteca; verificar/dimensionar no módulo técnico aplicável.'}}}
 return {...model,elements:[...model.elements,el],updatedAt:new Date().toISOString()}
}
