<?php

namespace App\Controller;

use App\Entity\Partenaire;
use App\Repository\PartenaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/partenaires')]
class PartenaireController extends AbstractController
{

    #[Route('', methods: ['GET'])]
    public function index(Request $request, PartenaireRepository $repo): JsonResponse
    {
        $type = $request->query->get('type');

        if ($type) {
            $partenaires = $repo->findBy(['type' => $type], ['id' => 'DESC']);
        } else {
            $partenaires = $repo->findBy([], ['id' => 'DESC']);
        }


        $data = [];
        foreach ($partenaires as $p) {
            $data[] = [
                'id' => $p->getId(),
                'nom_societe' => $p->getNomSociete(),
                'email' => $p->getEmail(),
                'telephone' => $p->getTelephone(),
                'adresse' => $p->getAdresse(),
                'ice' => $p->getIce(),
                'type' => $p->getType(),
            ];
        }

        return $this->json($data);
    }

    
    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $p = new Partenaire();

        $p->setNomSociete($data['nom_societe']);
        $p->setType($data['type']);

        if (isset($data['email'])) $p->setEmail($data['email']);
        if (isset($data['telephone'])) $p->setTelephone($data['telephone']);
        if (isset($data['adresse'])) $p->setAdresse($data['adresse']);
        if (isset($data['ice'])) $p->setIce($data['ice']);

        $em->persist($p);
        $em->flush();

        return $this->json(['message' => 'Partenaire ajouté', 'id' => $p->getId()], 201);
    }

    // 3. UPDATE
    #[Route('/{id}', methods: ['PUT'])]
    public function update(Partenaire $p, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['nom_societe'])) $p->setNomSociete($data['nom_societe']);
        if (isset($data['email'])) $p->setEmail($data['email']);
        if (isset($data['telephone'])) $p->setTelephone($data['telephone']);
        if (isset($data['adresse'])) $p->setAdresse($data['adresse']);
        if (isset($data['ice'])) $p->setIce($data['ice']);

        $em->flush();
        return $this->json(['message' => 'Partenaire mis à jour']);
    }

    // 4. DELETE
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Partenaire $p, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($p);
        $em->flush();
        return $this->json(['message' => 'Partenaire supprimé']);
    }
}
