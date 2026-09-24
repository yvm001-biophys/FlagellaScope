/* Phenomenological H+ motor + birth/death stators + exposure integration. */
const MotorModel=(()=>{
  const dt=1/4000,duration=30,eventStart=5,eventEnd=20;
  const defaults={target:50,voltage:150,dpH:.5,diameter:.5,radius:.3,viscosity:1,tau:2,fps:1000,exposure:.5,noise:8,stochastic:false,thermal:true};
  function pmf(c){return Math.max(0,c.voltage+59.16*c.dpH)}
  function drag(c){let a=c.diameter/2;return 6*Math.PI*c.viscosity*a*c.radius**2+8*Math.PI*c.viscosity*a**3}
  const curve={id:'knee_v1',stallPerStator:180,noLoadAtReference:300,kneeSpeedRatio:.65,kneeTorqueRatio:.9};
  function parameters(n,p){const noLoad=curve.noLoadAtReference*Math.max(0,p);return {stall:curve.stallPerStator*Math.max(0,n)*Math.max(0,p),noLoad,knee:noLoad*curve.kneeSpeedRatio}}
  function torque(n,p,f){if(n<=0||p<=0)return 0;const s=parameters(n,p),hz=Math.max(0,f);return hz<=s.knee?s.stall*(1-(1-curve.kneeTorqueRatio)*hz/s.knee):s.stall*curve.kneeTorqueRatio*Math.max(0,(s.noLoad-hz)/(s.noLoad-s.knee))}
  function speed(n,p,z){if(n<=0||p<=0)return 0;const s=parameters(n,p),loadSlope=2*Math.PI*z,lowSlope=s.stall*(1-curve.kneeTorqueRatio)/s.knee,low=s.stall/(loadSlope+lowSlope);if(low<=s.knee)return low;const highSlope=s.stall*curve.kneeTorqueRatio/(s.noLoad-s.knee);return highSlope*s.noLoad/(loadSlope+highSlope)}
  function matched(c){const z=drag(c),p=pmf(c)/180,f=speed(8,p,z)*c.target/100;return {force:c.target/100,stators:p>0?2*Math.PI*z*f/torque(1,p,f):8,load:p>0?torque(8,p,f)/(2*Math.PI*z*f):1}}
  function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
  function normal(random){return Math.sqrt(-2*Math.log(Math.max(1e-12,random())))*Math.cos(2*Math.PI*random())}
  function simulate(c,intervention,type,seed){
    const steps=Math.round(duration/dt),theta=new Float64Array(steps+1),ns=new Float32Array(steps+1),fs=new Float32Array(steps+1),random=rng(seed),thermalRandom=rng(seed+199),cameraRandom=rng(seed+99),z0=drag(c),p0=pmf(c)/180;
    let n=8;ns[0]=n;fs[0]=speed(n,p0,z0);
    for(let i=1;i<=steps;i++){
      const t=i*dt,active=t>=eventStart&&t<eventEnd,p=p0*(active&&type==='force'?intervention:1),z=z0*(active&&type==='load'?intervention:1),target=active&&type==='stators'?intervention:8;
      if(t>=eventStart){if(c.stochastic){const birth=(11-n)*target/(11*c.tau),death=n*(11-target)/(11*c.tau),u=random();if(u<birth*dt)n=Math.min(11,n+1);else if(u<(birth+death)*dt)n=Math.max(0,n-1)}else n+= (target-n)*(1-Math.exp(-dt/c.tau))}
      const f=speed(n,p,z);ns[i]=n;fs[i]=f;theta[i]=theta[i-1]+2*Math.PI*f*dt+(c.thermal?Math.sqrt(2*4.116/z*dt)*normal(thermalRandom):0);
    }
    const angleAt=t=>{const x=Math.max(0,Math.min(steps,t/dt)),i=Math.floor(x),j=Math.min(i+1,steps);return theta[i]+(theta[j]-theta[i])*(x-i)};
    const frames=[],exposure=Math.min(c.exposure/1000,1/c.fps);
    for(let k=0;k<=duration*c.fps;k++){
      const t=k/c.fps,lo=Math.max(0,t-exposure),m=Math.max(2,Math.ceil((t-lo)/dt)*4+1);let x=0,y=0;
      for(let j=0;j<m;j++){const a=angleAt(lo+(t-lo)*j/(m-1)),weight=(j===0||j===m-1?.5:1)/(m-1);x+=weight*Math.cos(a);y+=weight*Math.sin(a)}
      const contrast=Math.hypot(x,y),sigma=c.noise/(1000*c.radius);x+=sigma*normal(cameraRandom);y+=sigma*normal(cameraRandom);
      const a=Math.atan2(y,x),prev=frames[k-1],measured=prev&&contrast>=.15&&prev.contrast>=.15?Math.atan2(Math.sin(a-prev.angle),Math.cos(a-prev.angle))*c.fps/(2*Math.PI):null;
      const idx=Math.min(steps,Math.round(t/dt)),active=t>=eventStart&&t<eventEnd,p=p0*(active&&type==='force'?intervention:1),z=z0*(active&&type==='load'?intervention:1);
      frames.push({t,n:ns[idx],speed:fs[idx],pmf:p*180,drag:z,torque:2*Math.PI*z*fs[idx],angle:a,x,y,contrast,measured});
    }
    return {type,intervention,frames,theta,angleAt,exposure};
  }
  return {defaults,curve,parameters,torque,pmf,drag,speed,matched,simulate,duration,dt};
})();
if(typeof module!=='undefined')module.exports=MotorModel;
