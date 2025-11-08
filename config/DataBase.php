<?php
    $server = "localhost";
    $user = "root";
    $pass = "";
    $db = "uproject_db";

    $conn = new mysqli($server, $user, $pass, $db);

    if($conn->connect_errno){
        die("Conexion fallida" . $conn->connect_errno);
    }

    function execConsult($sql) {
        global $conn; // Usar la conexión del archivo de conexión

        $result = $conn->query($sql);

        if ($result === TRUE) {
            return true; // Para consultas tipo INSERT, UPDATE, DELETE
        } elseif ($result) {
            return $result->fetch_all(MYSQLI_ASSOC); // Para SELECT
        } else {
            return "Error en la consulta: " . $conn->error;
        }
    }
?>