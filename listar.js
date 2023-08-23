// Listado de inventario v3.8


//funcion que crea la exec

// para formatear los bits para guardar la exec con saveAs.
function s2ab(s) { 
  var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  var view = new Uint8Array(buf);  //create uint8array as viewer
  for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
  return buf;    
  }


function excel(objeto,fichero,nombre_hoja){
  var wb = XLSX.utils.book_new();
  wb.SheetNames.push(nombre_hoja);
  var ws_data = [claves=Object.keys(objeto[0])]; //pongo las cabeceras
  
  objeto.forEach(function(elemento){
      ws_data.push(Object.values(elemento));
  })       
  var ws = XLSX.utils.aoa_to_sheet(ws_data);
  wb.Sheets[nombre_hoja] = ws;

//creo el archivo
var wbout = XLSX.write(wb, {bookType:'xls',  type: 'binary'});
// lo guardo
saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), fichero+'.xls');

}

// devuelve la linea formateada para imprimir 
function crea_linea(elemento){
   
  var linea=elemento['Part#'];

  linea=linea+" "+elemento.Description.slice(0,36);
  // si es corta la completo con espacios;
  if (linea.length<46) for (var x=linea.length;x<47;x++){linea=linea+" "}; //lleno hasta 46
  linea=linea+" (";
  if (!Number.isNaN(parseInt(elemento.Count))) linea=linea+elemento.Count+"->"; //esta contado
  if (Number.isNaN(parseInt(elemento.OnHand))) linea=linea+"0" // pongo cero
     else linea=linea+elemento.OnHand;
  linea=linea+"/";
  if (Number.isNaN(parseInt(elemento.Target))) linea=linea+"0" //pongo 0
      else linea=linea+elemento.Target;
  if (!Number.isNaN(parseInt(elemento.OnOrder))) linea=linea+"<-"+elemento.OnOrder; //esta pendiente
  linea=linea+")";
  if (linea.length<61) for (var x=linea.length;x<62;x++){linea=linea+" "}; //lleno hasta 62
  
  if (elemento.Comments=="SCRAP") linea=linea+" ==SCRAP==";
  if (elemento.RW=="Y") linea=linea+">>RETORNO<<";
  
  return linea;
}

// funcion que verifica el que nombre del fichero sea correcto
function nombre_fichero(nombre){
        const prohibidos=' " / \\ ; : * ? % & $ @ { } [ ] > < + '; //caracteres prohibidos
    
        for (let indice = 0; indice < prohibidos.length-1; indice++) { 
          if (nombre.includes(prohibidos[indice])) {
              alert("ERROR:\n El Nombre del Fichero NO Puede Tener:\n [Espacio] "+prohibidos);       
              return false;
          }
        };
      return true; // sillegamos aqui esta correcto
}



//******* PROGRAMA PRINCIPAL*************//

     
// verifico que hay inventario cargado
if (localStorage.getItem("inventario")===null) {
            alert("Carga Primero un Inventario."); 
            window.location="index.html";}
     
// cargo el inventario
let inventario=JSON.parse(localStorage.getItem("inventario"));
let cuenta=0;
 
//listar todo
todo.addEventListener('click', function(){     
      titulo.textContent="Todas las Piezas";
      if (inventario.length==0){listado.value="NO HAY DATOS";return}; //listado vacio
      listado.value=""; //borro el listado 
      inventario.forEach(element => {listado.value=listado.value+crea_linea(element)+"\n";}); 
      listado.value=listado.value.slice(0,-1);//quito el ultimo enter 
       
});

//listar devolucion
devolucion.addEventListener('click', function(){
        titulo.textContent="Piezas con Devolucion";
        const piezas = inventario.filter((pieza) => pieza.RW == 'Y');
        if (piezas.length==0){listado.value="NO HAY DATOS";return}; //listado vacio
        listado.value=""; //borro el listado 
        piezas.forEach(element => {listado.value=listado.value+crea_linea(element)+"\n";});
        listado.value=listado.value.slice(0,-1);//quito el ultimo enter          
});
  
//listar PPK
ppk.addEventListener('click', function(){
        titulo.textContent="Piezas en el PPK";
        const piezas = inventario.filter((pieza) => pieza.Target != "");
        if (piezas.length==0){listado.value="NO HAY DATOS";return}; //listado vacio 
        listado.value=""; //borro el listado 
        piezas.forEach(element => {listado.value=listado.value+crea_linea(element)+"\n";});
        listado.value=listado.value.slice(0,-1);//quito el ultimo enter                      
});
  
//listar No PPK
noppk.addEventListener('click', function(){
        titulo.textContent="Piezas NO en PPK";
       const piezas = inventario.filter((pieza) => pieza.Target == "");      
       if (piezas.length==0){listado.value="NO HAY DATOS";return}; //listado vacio
       listado.value=""; //borro el listado 
       piezas.forEach(element => {listado.value=listado.value+crea_linea(element)+"\n";});
       listado.value=listado.value.slice(0,-1);//quito el ultimo enter                                
});
  
//listar contadas
contadas.addEventListener('click', function(){
        titulo.textContent="Piezas Contadas";
        const piezas = inventario.filter((pieza) =>!Number.isNaN(parseInt(pieza.Count)));
        if (piezas.length==0){listado.value="NO HAY DATOS";return}; //listado vacio
        listado.value=""; //borro el listado 
        piezas.forEach(element => {listado.value=listado.value+crea_linea(element)+"\n";});
        listado.value=listado.value.slice(0,-1);//quito el ultimo enter                                
            
});
      
//listar no contadas
nocontadas.addEventListener('click', function(){
        titulo.textContent="Piezas NO Contadas";
        const piezas = inventario.filter((pieza) => Number.isNaN(parseInt(pieza.Count)));
        if (piezas.length==0){listado.value="NO HAY DATOS";return}; //listado vacio
        listado.value=""; //borro el listado 
        piezas.forEach(element => {listado.value=listado.value+crea_linea(element)+"\n";});
        listado.value=listado.value.slice(0,-1);//quito el ultimo enter                                           
});
      
//exportar a TXT      
txt.addEventListener('click', function(){

        if ((listado.value=="") || (listado.value=="NO HAY DATOS")) {
                    alert("ERROR:\n El Listado Esta Vacio.")
                    return;}
          
        let respuesta=prompt("Nombre del Fichero:","");
        
        if (respuesta==null) return;// se pulso cancelar
        if (!nombre_fichero(respuesta)) respuesta=""; // contiene caracteres prohibidos pongo cadena vacia       
        if (respuesta=="") return;// cadena vacia
        
        saveAs(new Blob([listado.value],{type:"text/plain"}), respuesta+'.txt');
        loggea(titulo.textContent,respuesta+".txt");
  
});
  
//descargar XLS
xls.addEventListener('click', function(){
          let respuesta=prompt("Nombre del Fichero:","");
          if (respuesta==null) return;// se pulso cancelar
          if (!nombre_fichero(respuesta)) respuesta=""; // contiene caracteres prohibidos pongo cadena vacia
          if (respuesta=="") return;// cadena vacia

          excel(inventario,respuesta,"CE_STOCK_STATUS-1");
          loggea("DOWNLOAD",respuesta+".xls");
          
}); 

auto.addEventListener('click', function(){
          if (!confirm("ATENCION:\n\n  Se Autocontaran las Piezas SIN Devolucion.")) return;
          
         inventario.forEach(encontrado => {
                  //if (Number.isNaN(parseInt(encontrado.Count))&&(!Number.isNaN(parseInt(encontrado.OnHand)))) encontrado.Count=encontrado.OnHand;
                  if (encontrado.RW=='N') encontrado.Count=encontrado.OnHand;         
           });
           localStorage.setItem("inventario",JSON.stringify(inventario)); // guardo los cambios
           cuenta++;
           todo.click();
           auto.style.display='none';
           loggea("AUTO FULL",localStorage.getItem("fichero"));
                      
});

guarda.addEventListener('click', async function(){
    
        if (!confirm("Guardado en la Nube:\n\n Esto guardara el inventario en uso en la nube.\n Hay que suministrar un nombre y una password.\n Despues podremos recuperarlo desde otro terminal.\n\nNOTA: Los Inventarios se BORRAN a la Semana.")){return;}

        let fichero=prompt("Nombre del Inventario:","");
        if (fichero==null) return;// se pulso cancelar
        if (!nombre_fichero(fichero)) fichero=""; // contiene caracteres prohibidos pongo cadena vacia       
        if (fichero=="") return;// cadena vacia

        let password=prompt("Password de Inventario:","");
        if ((password=="") || (password==null)) {alert("ERROR:\nSe Necesita un Password para el Inventario.");return;}

        let verifica= await nube("verifica",fichero,password,"");
        if (password==verifica) {
                if (!confirm("Sobreescrir el Inventario "+fichero+ "?")) return;
            verifica=""; // para que sobreescriva el fichero
        }


        if (verifica=="") {
                if (await nube("guarda",fichero,password,JSON.stringify(inventario))=="SAVE_OK") {loggea("SAVE",fichero);alert(fichero+"\nGuardado OK.");}
                else alert("ERROR:\n Inventario NO Guardado.");
                return;
        }
     
        // si llego aqui el fichero existe y la pass en incorecta.
        alert("ERROR:\nYa existe un Inventario con ese Nombre.");

});
        
        //*****************************************//
  