// Control de Inventario v4.0
 
//funcion que carga el fichero excel en inventario
function loadxls(fichero_xls){
    
      var reader = new FileReader();
  
      //reader.onload = function(e) {
       
       reader.onload = (e)=> {
          var data = e.target.result;
            var workbook = XLSX.read(data,{type: 'binary'});
            var datos= XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]]);
            
            //compruevo las colunnas de la exel.
            if (Object.keys(datos[0])[0]=="Part#")//,Shipment/Cust PO#,Description,OnHand,OnOrder,Target,Cost,Issue Date,RW,Locator,Count,Comments")
            {
                //cargo el inventario 
                inventario=datos;
                 //guardo el inventario
                localStorage.setItem("inventario",JSON.stringify(datos));
                //guardo el nombre del fichero
                localStorage.setItem("fichero",fichero_xls.name);
                //pongo el nombre en el boton
                fichero.textContent=fichero_xls.name;
            }
             else { 
                  //guardo el primer registro en un fichero en el directorio errores.
                  nube("error",fichero_xls.name,"",JSON.stringify(datos[0]));
                  //loggeo la direcion web del fichero de error
                  alert("ERROR:\nFichero XLS NO Valido.");
                  localStorage.removeItem("inventario"); //borro el inventario cargado
                  localStorage.removeItem("fichero"); //borro el nombre del fichero
                  fichero.textContent="Cargar Fichero.xls"; //borro el nombre del fichero
                  inputfile.reset();
              }
            }
       reader.onerror = function(ex) {console.log(ex);};
       reader.readAsBinaryString(fichero_xls);
    }; 
  
function busqueda(){

      // el PN es invalido
        if (pn.value.length!=10){
            
          if (pn.value=='') {descripcion.textContent=''; pn.value="";}//pn vacio 
            else descripcion.textContent='P/N no Valido';
            descripcion.style.color='orange';
            Cantidad.style.display='none';
            asignados.style.display='none';
            retornable.style.display='none';
            contados.style.display='none';
            return;  
        }
        //no hay fichero XLS
        if (localStorage.getItem("inventario")===null) {alert("Carga Primero el Fichero XLS"); return}
        
        //var encontrado=inventario.find( pieza => pieza.Part === pn.value);
        indice=inventario.findIndex( pieza => pieza['Part#'] === pn.value);

        if (inventario[indice]===undefined) { // pieza no encontrada
            descripcion.textContent='No Encontrado';
            descripcion.style.color='silver';
            Cantidad.style.display='none';
            asignados.style.display='none';
            retornable.style.display='none';
            contados.style.display='none';


          }
        else { //pizeza encontrada

              //pieza enncontrada por primera vez
              descripcion.textContent=inventario[indice].Description;
              Cantidad.style.display='inline';
              asignados.style.display='inline';
              retornable.style.display='inline';
              contados.style.display='flex';
              Cantidad.textContent="Cant: "+inventario[indice].OnHand;
              scrap_check('D'); // por defecto deshabilito scrap

              if (inventario[indice].Target=="") asignados.textContent="Asig: 0";
                 else asignados.textContent="Asig: "+inventario[indice].Target;

              if (inventario[indice].OnOrder!="") {
                if (Cantidad.textContent=="Cant: ") Cantidad.textContent=""; // no hay cantidad borro todo
                asignados.textContent="Pend. Recibir: "+inventario[indice].OnOrder;
                }
              if (inventario[indice].RW=='Y') {
                 retornable.textContent='RETORNABLE';
                 retornable.style.color='tomato';
                 descripcion.style.color='tomato';
                 }
              else { 
                retornable.textContent='NO RETORNABLE';
                retornable.style.color='green';
                descripcion.style.color='green';
                // si no tiene asignado ni en transito lo habilito deseleccionado
                if (Number.isNaN(parseInt(inventario[indice].Target))  
                         && (inventario[indice].OnOrder=="" )) scrap_check('N');
                }

                //Si count esta vacio lo pongo a 1 
                 if (Number.isNaN(parseInt(inventario[indice].Count))) count.value='1';
                 else if (confirm("P/N Ya Encontrado. Añadir Otra Unidad?")) count.value=parseInt(inventario[indice].Count)+1;
                         else count.value=parseInt(inventario[indice].Count);

              inventario[indice].Count=count.value;
              localStorage.setItem("inventario",JSON.stringify(inventario)); // guardo los cambios
                    
              if (parseInt(inventario[indice].Count)<parseInt(inventario[indice].OnHand)) count.style.borderColor='orange';
              if (parseInt(inventario[indice].Count)>parseInt(inventario[indice].OnHand)) count.style.borderColor='red';
              if (parseInt(inventario[indice].Count)==parseInt(inventario[indice].OnHand)) count.style.borderColor='green';
              
              // si esta activado el scrap comprobamos si ya esta checkaco y lo ponemos en checked
              if ((lscrap.style.Color!='grey') && (inventario[indice].Comments=="SCRAP")) scrap_check('S'); 
              
        }
        pn.focus()
      }     


   function scrap_check(estado){

    if (estado=='S') { // Seleccionada
      scrap.style.backgroundColor='black';
      scrap.style.borderColor='green';
      lscrap.style.color='green';
      marca.style.display='inline';
    }
    
    if (estado=='N') { //Deseleccionada
      scrap.style.backgroundColor='black';
      scrap.style.borderColor='white';
      lscrap.style.color='white';
      marca.style.display='none';
    }
    
    if (estado=='D') { //Deshabilitada
      scrap.style.backgroundColor='black';
      scrap.style.borderColor='grey';
      lscrap.style.color='grey';
      marca.style.display='none';
    } 

  }

//***** PROGRAMA PRINCIPAL*************//

let inventario; //almacenamos toda la excel en array de elemtos
let indice; //el indice del elemeto mostrado


//Autocarga
if ((localStorage.getItem("fichero")!==null) && (localStorage.getItem("inventario")!==null)){
    fichero.textContent=localStorage.getItem("fichero");
    inventario=JSON.parse(localStorage.getItem("inventario"));
}

//upload.accept=".xls";
upload.accept="application/vnd.ms-excel"


//CARGAR DEL FICHERO***************************************************************
upload.addEventListener('change', function(){
  
  //no se ha seleccionado nada salimos
  if (upload.files[0]===undefined) return;  
 
  loadxls(upload.files[0]);

  // loggea el loadxls

});


importar.addEventListener('click', function(){ 

  if (fichero.textContent!='Cargar Fichero.xls')
          if (!confirm("Importar Inventario desde Fichero.XLS\n\nATENCION: Se Borrara el Inventario en Curso.")) return;
  upload.click();
  descripcion.textContent='';
  pn.value='';
  Cantidad.style.display='none';
  asignados.style.display='none';
  retornable.style.display='none';
  contados.style.display='none';
});

//importar.addEventListener('click',function(){fichero.click()});

buscar.addEventListener('click',busqueda);



pn.addEventListener("keypress", function(event) {
     if (event.key === 'Enter') buscar.click();
    });

// si pulso [espacio] o . borro el p/n
// se usa este evento porque los key no funcionan en el mobil
pn.addEventListener("textInput",function(event){
   if (event.data==" ") {this.value="";busqueda();return};
   if (event.data==".") {this.value="";busqueda();return};
   if (event.data==",") {this.value="";busqueda();return};
   if (event.data=="e") {this.value="";busqueda();return};
   // si solo hay una e coma o punto el valor es cero y lo borro.
   if (pn.value=="") {pn.value="";buscar.click();return}; 
   });

  
count.addEventListener("change", function(){
        count.value=Math.trunc(count.value);
        if (count.value==inventario[indice].Count) return; // es la misma catidad no hago nada.
        inventario[indice].Count=count.value;   
        localStorage.setItem("inventario",JSON.stringify(inventario)); // guardo los cambios
        if (parseInt(inventario[indice].Count)<parseInt(inventario[indice].OnHand)) count.style.borderColor='orange';
        if (parseInt(inventario[indice].Count)>parseInt(inventario[indice].OnHand)) count.style.borderColor='red';
        if (parseInt(inventario[indice].Count)==parseInt(inventario[indice].OnHand)) count.style.borderColor='green';
        alert("Cantidad Modificada");
        pn.focus();        
});

scrap.addEventListener('click',function(){
  // esta deshabilitada
  if (lscrap.style.color=='grey') return;

  //conmuto
  if (lscrap.style.color=='green') {
         scrap_check('N');
         inventario[indice].Comments="  ";
  }
     else {
          scrap_check('S');
          inventario[indice].Comments="SCRAP";
     }
  localStorage.setItem("inventario",JSON.stringify(inventario)); // guardo los cambios
});

lscrap.addEventListener('click',function(){scrap.click()});


// recuperamos el inventario de la nube
abrir.addEventListener('click', async function(){
  if (fichero.textContent!='Cargar Fichero.xls') 
    if (!confirm("Recuperar un Inventario Guardado en la Nube.\n\nATENCION: Se Borrara el Inventario en Curso.")) return;
  
     let n_inventario=prompt("Nombre del Inventario Guardado en la Nube:","");
     if ((n_inventario=="") || (n_inventario==null)) {alert("ERROR:\nSe Necesita el Nombre del Inventario.");return;}

     let password=prompt("Password del Inventario:","");
     if ((password=="") || (password==null)) {alert("ERROR:\nSe Necesita el Password del Inventario.");return;}

     let respuesta= await nube("carga",n_inventario,password,"");
     
     if (respuesta=="PASS_ERROR") {alert("ERROR:\nPassword NO Valido.");loggea("ERROR_PASS",n_inventario);return;}
     if (respuesta=="NO_FILE") {alert("ERROR:\nInventario NO Encontrado.");return;}

     //inicializo los datos de la pantalla
     descripcion.textContent='';
     pn.value='';
     Cantidad.style.display='none';
     asignados.style.display='none';
     retornable.style.display='none';
     contados.style.display='none';

    inventario=JSON.parse(respuesta);// cargo el inventario
    localStorage.setItem("inventario",respuesta);//lo guardo el local
    fichero.textContent=n_inventario.toLocaleUpperCase(); // pongo el nombre del inventario
    localStorage.setItem("fichero",fichero.textContent); //lo guardo en local
    loggea("LOAD",fichero.textContent);

});

//*************************************//
