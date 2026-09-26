/* A single row of simulator settings, never observational time-series data. */
const ConditionsCSV=(()=>{
 const limits={target:[25,90],voltage:[0,220],dpH:[-1,2],diameter:[.2,1.2],radius:[.1,.8],viscosity:[.5,5],tau:[.2,5],fps:[30,2000],exposure:[.05,10],noise:[0,40],force:[.1,1],stators:[0,11],load:[1,12]};
 const booleans=['interventionEnabled','stochastic','thermal'];
 const keys=[...Object.keys(limits),...booleans];
 function rows(text){
  const result=[];let row=[],field='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++){
   const ch=text[i];
   if(quoted){if(ch==='"'){if(text[i+1]==='"'){field+='"';i++}else{quoted=false;closed=true}}else field+=ch;continue}
   if(ch==='"'&&!field&&!closed){quoted=true;continue}
   if(ch===','){row.push(field.trim());field='';closed=false;continue}
   if(ch==='\n'||ch==='\r'){row.push(field.trim());if(row.some(x=>x!==''))result.push(row);row=[];field='';closed=false;if(ch==='\r'&&text[i+1]==='\n')i++;continue}
   if(closed||ch==='"')throw Error('Malformed CSV quoting');
   field+=ch;
  }
  if(quoted)throw Error('Unclosed CSV quote');
  row.push(field.trim());if(row.some(x=>x!==''))result.push(row);
  return result;
 }
 function parse(text){
  const table=rows(text.replace(/^\uFEFF/,''));
  if(table.length!==2)throw Error('CSV must contain one header and one settings row');
  const [header,values]=table;
  if(header.length!==values.length||new Set(header).size!==header.length||!header.length)throw Error('Duplicate columns or mismatched row length');
  const result={};
  header.forEach((key,i)=>{
   if(!keys.includes(key))throw Error('Unknown column: '+key);
   const raw=values[i];if(raw==='')throw Error('Empty value: '+key);
   if(booleans.includes(key)){
    if(!/^(true|false)$/i.test(raw))throw Error(key+' must be true or false');
    result[key]=raw.toLowerCase()==='true';
   }else{
    if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw))throw Error('Invalid number: '+key);
    const value=Number(raw),[min,max]=limits[key];
    if(!Number.isFinite(value)||value<min||value>max||key==='fps'&&!Number.isInteger(value))throw Error(key+' must be within '+min+'–'+max+(key==='fps'?' and an integer':''));
    result[key]=value;
   }
  });
  return result;
 }
 return {parse,keys,limits};
})();
if(typeof module!=='undefined')module.exports=ConditionsCSV;
