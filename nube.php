<?php
// Gestiona los ficheros guardados en el servidor v1.1


// Verificamos si existe el fichero
if ($_POST['accion']=="verifica"){
    if (file_exists("../../inventarios/".$_POST['nombre'].".json")) {
        //cargo el fichero
        $fichero=json_decode(file_get_contents("../../inventarios/".$_POST['nombre'].".json"), true); 
        echo $fichero['password'];
    }
    else  echo ""; //no existe devuelvo password vacio
return; 
}

//Guardamos el fichero
if ($_POST['accion']=="guarda"){
     $fichero['inventario']=$_POST['inventario'];
     $fichero['password']=$_POST['password'];
     file_put_contents("../../inventarios/".$_POST['nombre'].".json",json_encode($fichero));
    echo "SAVE_OK";
    return;
}


//Guardamos el fichero que dio error
if ($_POST['accion']=="error"){
    $fichero=$_POST['inventario'];
    file_put_contents("./errores/".$_POST['nombre'].".json",json_encode($fichero));
   echo "SAVE_OK";
   return;
}


//Cargamos el fichero
if ($_POST['accion']=="carga"){
    if (file_exists("../../inventarios/".$_POST['nombre'].".json")) {
        //cargo el fichero
        $fichero=json_decode(file_get_contents("../../inventarios/".$_POST['nombre'].".json"), true); 
        // si la pass es corecta mendo el inventario
        if ($fichero['password']==$_POST['password']) echo $fichero['inventario']; 
        else echo "PASS_ERROR";
    }
   else echo "NO_FILE"; 
return;
}













?>