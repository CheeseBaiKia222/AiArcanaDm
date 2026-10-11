// Windows sandbox accounts may not have a Windows profile entry.
const os=require('node:os');const original=os.userInfo;
os.userInfo=(options)=>{try{return original(options);}catch(error){if(error.code!=='ERR_SYSTEM_ERROR')throw error;return {username:'sites-local',uid:-1,gid:-1,shell:null,homedir:os.homedir()};}};
require('node:module').syncBuiltinESMExports();
