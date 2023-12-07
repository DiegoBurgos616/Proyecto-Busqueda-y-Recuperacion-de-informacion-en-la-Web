<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Intenta decodificar el contenido JSON de la solicitud POST
    $request = json_decode(file_get_contents('php://input'));

    // Verifica si se pudo decodificar correctamente el JSON
    if ($request === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400); // Código de respuesta HTTP 400 Bad Request
        echo json_encode(['error' => 'Error en el formato JSON']);
        exit;
    }

    // Verifica si existe la propiedad 'links' en el objeto JSON
    if (!property_exists($request, 'links')) {
        http_response_code(400);
        echo json_encode(['error' => 'Propiedad "links" no encontrada en el JSON']);
        exit;
    }

    // Obtiene la información de los enlaces
    $info = implode("\n", $request->links);

    // Guarda la información en el archivo
    file_put_contents("../links.txt", $info);

    // Envía una respuesta JSON
    echo json_encode(['success' => true]);
} else {
    // Si el método no es POST, envía un código de respuesta 405 Method Not Allowed
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
