const products=[{id:'macbook-air-m1',brand:'Apple',name:'MacBook Air M1',chip:'Apple M1',ram:'8 GB',storage:'256 GB SSD',screen:'13.3-inch Retina',price:34999,tag:'THE EVERYDAY FAVOURITE',color:'purple',desc:'Light enough to go everywhere. Capable enough for your everyday ideas. A versatile MacBook for study, work and creative exploration.'},{id:'macbook-pro-m1',brand:'Apple',name:'MacBook Pro M1',chip:'Apple M1',ram:'8 GB',storage:'512 GB SSD',screen:'13.3-inch Retina',price:44999,tag:'MORE ROOM TO CREATE',color:'green',desc:'A capable creative companion with room for your projects. Explore the MacBook Pro for productive days and ideas that keep growing.'},{id:'dell-latitude-5420',brand:'Dell',name:'Dell Latitude 5420',chip:'Intel Core i5 (11th Gen)',ram:'16 GB',storage:'512 GB SSD',screen:'14-inch Full HD',price:26999,tag:'READY FOR THE WORKDAY',color:'orange',desc:'A practical business laptop for your daily workflow. Roomy memory and solid-state storage for documents, browser tabs and everyday work.'},{id:'macbook-air-m2',brand:'Apple',name:'MacBook Air M2',chip:'Apple M2',ram:'8 GB',storage:'256 GB SSD',screen:'13.6-inch Liquid Retina',price:52999,tag:'A LITTLE MORE POSSIBILITY',color:'blue',desc:'A fresh design with a spacious display and Apple silicon. A portable companion for the things you love to make.'},{id:'hp-elitebook-840',brand:'HP',name:'HP EliteBook 840 G8',chip:'Intel Core i5 (11th Gen)',ram:'16 GB',storage:'256 GB SSD',screen:'14-inch Full HD',price:28999,tag:'WORK FROM ANYWHERE',color:'purple',desc:'A thoughtfully built business notebook for meetings, presentations and getting things done wherever the day takes you.'},{id:'lenovo-thinkpad-t14',brand:'Lenovo',name:'Lenovo ThinkPad T14',chip:'Intel Core i5 (10th Gen)',ram:'16 GB',storage:'512 GB SSD',screen:'14-inch Full HD',price:27999,tag:'YOUR DAILY WORKHORSE',color:'green',desc:'A familiar business favourite with a practical design. Built around productive days and a comfortable typing experience.'}];
const galleries={
 'macbook-air-m1':{file:'images/products/atlas-air.png',cols:2,rows:2,labels:['Front view','Closed lid','Keyboard view','Left side']},
 'macbook-pro-m1':{file:'images/products/atlas-pro.png',cols:2,rows:2,labels:['Front view','Closed lid','Keyboard view','Left side']},
 'macbook-air-m2':{file:'images/products/atlas-m2.png',cols:2,rows:1,labels:['Front view','Keyboard view']},
 'dell-latitude-5420':{file:'images/products/atlas-dell.png',cols:2,rows:2,labels:['Left angle','Right angle','Front view','Rear view']},
 'hp-elitebook-840':{file:'images/products/atlas-hp.png',cols:2,rows:2,labels:['Front view','Keyboard detail','Rear angle','Left side']},
 'lenovo-thinkpad-t14':{file:'images/products/atlas-lenovo.png',cols:2,rows:2,labels:['Front view','Left side','Rear angle','Front angle']}
};
const photoRegions={
 'macbook-air-m1':[[0,100,670,520],[670,100,584,520],[0,640,690,560],[690,627,564,573]],
 'dell-latitude-5420':[[0,0,640,700],[640,0,614,700],[0,710,650,544],[650,710,604,544]],
 'hp-elitebook-840':[[0,0,650,627],[650,0,604,627],[0,627,650,627],[650,627,604,627]]
};
function photoMarkup(p,index=0,extra=''){
 const g=galleries[p.id],w=g.rows===1?1774:1254,h=g.rows===1?887:1254;
 const r=photoRegions[p.id]?.[index]||[index%g.cols*w/g.cols,Math.floor(index/g.cols)*h/g.rows,w/g.cols,h/g.rows];
 const [x,y,rw,rh]=r,ratio=rw/rh;
 return `<span class="photo-sprite ${extra}"><span class="photo-crop" style="--photo-ratio:${ratio};aspect-ratio:${rw}/${rh}"><img src="${g.file}" alt="${p.name} — ${g.labels[index]}" width="${w}" height="${h}" style="width:${w/rw*100}%;height:${h/rh*100}%;left:${-x/rw*100}%;top:${-y/rh*100}%" draggable="false"></span></span>`
}
