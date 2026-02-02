<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class UploadController extends AbstractController
{
    #[Route('/api/upload', name: 'api_upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {

        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile) {
            return new JsonResponse(['error' => 'No file uploaded'], 400);
        }


        $destination = $this->getParameter('kernel.project_dir') . '/public/uploads';



        $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
        $newFilename = uniqid() . '.' . $uploadedFile->guessExtension();


        try {
            $uploadedFile->move($destination, $newFilename);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Error uploading file'], 500);
        }

       
        $fullUrl = $request->getSchemeAndHttpHost() . '/uploads/' . $newFilename;

        return new JsonResponse([
            'fileName' => $newFilename,
            'url' => $fullUrl
        ]);
    }
}
