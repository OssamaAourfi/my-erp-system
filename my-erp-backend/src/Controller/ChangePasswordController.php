<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Entity\User;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[Route('/api/change-password', name: 'app_change_password', methods: ['POST'])]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class ChangePasswordController extends AbstractController
{
    public function __invoke(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();


        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Utilisateur invalide ou non connecté.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (!$currentPassword || !$newPassword) {
            return new JsonResponse(['message' => 'Données manquantes'], 400);
        }

        if (!$passwordHasher->isPasswordValid($user, $currentPassword)) {
            return new JsonResponse(['message' => 'Mot de passe actuel incorrect !'], 400);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);


        $user->setPassword($hashedPassword);

        $entityManager->flush();

        return new JsonResponse(['message' => 'Mot de passe modifié avec succès !'], 200);
    }
}
