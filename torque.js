/* A snapshot of the same knee motor law used by MotorModel.speed. */
function torqueText(ja,en){return I18n.language==='ja'?ja:en}
function torqueSnapshot(){
 return data.map((d,i)=>{const f=current(d),p=f.pmf/180,n=f.n,z=f.drag;
   // Recompute from full-precision parameters; stored time-series speed uses Float32.
   const speed=M.speed(n,p,z),torque=2*Math.PI*z*speed,noLoad=p>0&&n>0?M.parameters(n,p).noLoad:0,stall=M.parameters(n,p).stall,knee=noLoad*M.curve.kneeSpeedRatio;
   const points=Array.from({length:noLoad>0?301:1},(_,j)=>{const hz=noLoad*j/300;return {speed:hz,motor:M.torque(n,p,hz),load:2*Math.PI*z*hz}});
   if(noLoad>0&&!points.some(pt=>Math.abs(pt.speed-knee)<1e-10)){points.push({speed:knee,motor:M.torque(n,p,knee),load:2*Math.PI*z*knee});points.sort((a,b)=>a.speed-b.speed)}
   return {knee,id:d.type,index:i,time:f.t,selectedTime:clock,n,pmf:f.pmf,drag:z,speed,torque,noLoad,stall,points};
 });
}
function torqueSVG(snapshot){
 const W=1050,H=630,L=90,R=35,T=100,B=160,xmax=Math.max(1,300*M.pmf(config)/180,...snapshot.map(s=>s.noLoad))*1.08,ymax=Math.max(1,180*11*M.pmf(config)/180,...snapshot.map(s=>s.stall))*1.08;
 const x=v=>L+v/xmax*(W-L-R),y=v=>H-B-v/ymax*(H-T-B),esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const label=(xx,yy,text,size=15,fill='#a6b7cd',extra='')=>`<text x="${xx}" y="${yy}" font-size="${size}" fill="${fill}" ${extra}>${esc(text)}</text>`;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(torqueText('トルク–スピード曲線と動作点','Torque–speed curves and operating points'))}"><rect width="100%" height="100%" fill="#101e30"/><g font-family="Arial, sans-serif">`;
 svg+=label(35,34,'FlagellaScope · '+torqueText('トルク–スピード曲線と動作点','Torque–speed curves and operating points'),23,'#edf3fc');
 svg+=label(35,60,torqueText('選択フレーム','Selected frame')+`: ${number(snapshot[0]?.time??clock,3)} s · `+torqueText('瞬時の固定子数・駆動力・負荷を固定','Stator count, motive force and load held at this instant'),14);
 for(let j=0;j<=5;j++){let xx=x(xmax*j/5),yy=y(ymax*j/5);svg+=`<path d="M${xx} ${T}V${H-B} M${L} ${yy}H${W-R}" stroke="#29394e"/>`;svg+=label(xx,H-B+25,number(xmax*j/5,0),14,undefined,'text-anchor="middle"');svg+=label(L-12,yy+5,number(ymax*j/5,0),14,undefined,'text-anchor="end"')}
 svg+=label((L+W-R)/2,H-B+53,torqueText('回転速度 / Hz','Rotation speed / Hz'),16,'#edf3fc','text-anchor="middle"');
 svg+=`<text transform="translate(24 ${(T+H-B)/2}) rotate(-90)" text-anchor="middle" font-size="16" fill="#edf3fc">${esc(torqueText('トルク / pN nm','Torque / pN nm'))}</text>`;
 snapshot.forEach((s,i)=>{const c=colors[i];svg+=`<path d="M${x(0)} ${y(s.stall)}L${x(s.knee)} ${y(M.torque(s.n,s.pmf/180,s.knee))}L${x(s.noLoad)} ${y(0)}" fill="none" stroke="${c}" stroke-width="3"/>`;const end=Math.min(xmax,ymax/(2*Math.PI*s.drag));svg+=`<path d="M${x(0)} ${y(0)}L${x(end)} ${y(2*Math.PI*s.drag*end)}" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="7 6" opacity=".65"/>`});
 // Concentric outlines preserve all three markers when operating points coincide.
 snapshot.forEach((s,i)=>{svg+=`<circle cx="${x(s.speed)}" cy="${y(s.torque)}" r="${11-3*i}" stroke="${colors[i]}" stroke-width="2.7" fill="${i===2?colors[i]:'#101e30'}"/>`});
 snapshot.forEach((s,i)=>{const xx=35+i*340;svg+=label(xx,550,`${i+1}. ${I18n.t(names[i])}`,16,colors[i]);svg+=label(xx,575,`${number(s.speed,2)} Hz · ${number(s.torque,2)} pN nm`,15,'#edf3fc');svg+=label(xx,597,`N=${number(s.n,2)} · P=${number(s.pmf,1)} mV · ζ=${number(s.drag,3)}`,13)});
 svg+=label(35,622,torqueText('実線：モーター　破線：負荷　丸：動作点　｜　kneeモデル（実測フィットではありません）','Solid: motor · Dashed: load · Circles: operating points | Knee model (illustrative)'),13);
 return svg+'</g></svg>';
}
function renderTorque(){if(!data.length)return;$('#torquePlot').innerHTML=torqueSVG(torqueSnapshot())}
function torqueCSV(snapshot){
 const head=['row_type','condition','frame_time_s','selected_time_s','speed_Hz','motor_torque_pN_nm','load_torque_pN_nm','stators','pmf_mV','drag_pN_nm_s','operating_speed_Hz','operating_torque_pN_nm','stall_torque_pN_nm','no_load_speed_Hz','baseline_voltage_mV','delta_pH','bead_diameter_um','orbit_radius_um','baseline_viscosity_mPa_s','stochastic','intervention_enabled','model','knee_speed_Hz','knee_torque_pN_nm','knee_speed_ratio','knee_torque_ratio'];
 const rows=[head.join(',')];for(const s of snapshot){const tail=[s.n,s.pmf,s.drag,s.speed,s.torque,s.stall,s.noLoad,config.voltage,config.dpH,config.diameter,config.radius,config.viscosity,config.stochastic,config.interventionEnabled,M.curve.id,s.knee,M.torque(s.n,s.pmf/180,s.knee),M.curve.kneeSpeedRatio,M.curve.kneeTorqueRatio];for(const pt of s.points)rows.push(['curve',s.id,s.time,s.selectedTime,pt.speed,pt.motor,pt.load,...tail].join(','));rows.push(['operating_point',s.id,s.time,s.selectedTime,s.speed,s.torque,s.torque,...tail].join(','))}return rows.join('\n');
}
function downloadTorque(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportTorque(kind){
 const snapshot=torqueSnapshot(),name=`flagellascope-torque-speed-${number(snapshot[0].time,3)}s`,svg=torqueSVG(snapshot);$('#torqueExportStatus').textContent='';
 if(kind==='csv'){downloadTorque(new Blob([torqueCSV(snapshot)],{type:'text/csv;charset=utf-8'}),name+'.csv');return}
 if(kind==='json'){downloadTorque(new Blob([JSON.stringify({format:'FlagellaScope torque-speed v1',settings:{...config},interventionSettings:{...interventions},model:{...M.curve},conditions:snapshot.map(({id,time,selectedTime,n,pmf,drag,speed,torque,noLoad,stall,knee,points})=>({condition:id,frame_time_s:time,selected_time_s:selectedTime,stators:n,pmf_mV:pmf,drag_pN_nm_s:drag,operating_speed_Hz:speed,operating_torque_pN_nm:torque,no_load_speed_Hz:noLoad,stall_torque_pN_nm:stall,knee_speed_Hz:knee,points}))})],{type:'application/json;charset=utf-8'}),name+'.json');return}
 if(kind==='svg'){downloadTorque(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),name+'.svg');return}
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
 img.onload=()=>{try{const c=document.createElement('canvas');c.width=2100;c.height=1260;c.getContext('2d').drawImage(img,0,0,c.width,c.height);c.toBlob(blob=>{if(blob)downloadTorque(blob,name+'.png');else $('#torqueExportStatus').textContent=torqueText('PNG出力に失敗しました。SVG出力をお試しください。','PNG export failed. Please use SVG export.');},'image/png')}catch{$('#torqueExportStatus').textContent=torqueText('PNG出力に失敗しました。SVG出力をお試しください。','PNG export failed. Please use SVG export.')}finally{URL.revokeObjectURL(url)}};
 img.onerror=()=>{URL.revokeObjectURL(url);$('#torqueExportStatus').textContent=torqueText('PNG出力に失敗しました。SVG出力をお試しください。','PNG export failed. Please use SVG export.')};img.src=url;
}
for(const kind of ['png','svg','csv','json'])document.querySelector('#torque-'+kind).onclick=()=>exportTorque(kind);
