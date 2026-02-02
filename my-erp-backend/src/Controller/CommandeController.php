<?php

namespace App\Controller;

use App\Entity\Commande;
use App\Entity\LigneCommande;
use App\Repository\ProduitRepository;
use App\Repository\PartenaireRepository;
use App\Repository\CommandeRepository; 
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/custom/commandes')]
class CommandeController extends AbstractController
{

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ProduitRepository $produitRepo, PartenaireRepository $partenaireRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['lignes'])) {
            return $this->json(['message' => 'Aucun produit sélectionné'], 400);
        }

        $commande = new Commande();
        $commande->setDate(new \DateTime());
        $commande->setReference($data['reference'] ?? 'CMD-' . time());
        $commande->setType('vente');
        $commande->setStatut('DEVIS');

        if (!empty($data['partenaire'])) {
            $partenaire = $partenaireRepo->find($data['partenaire']);
            if ($partenaire) {
                $commande->setPartenaire($partenaire);
            }
        }

        $totalGeneral = 0;

        foreach ($data['lignes'] as $ligneData) {
            $produitId = $ligneData['id'] ?? $ligneData['produit_id'] ?? null;
            $quantite = $ligneData['quantite'];

            if (!$produitId) return $this->json(['message' => "ID produit manquant"], 400);

            $produit = $produitRepo->find($produitId);
            if (!$produit) return $this->json(['message' => "Produit introuvable"], 404);


            $prixUnitaire = $produit->getPrixVente();
            $totalGeneral += ($prixUnitaire * $quantite);

            $ligneCommande = new LigneCommande();
            $ligneCommande->setProduit($produit);
            $ligneCommande->setQuantite($quantite);
            $ligneCommande->setPrixUnitaire($prixUnitaire);
            $ligneCommande->setCommande($commande);

            $em->persist($ligneCommande);
        }

        if (method_exists($commande, 'setTotal')) {
            $commande->setTotal($totalGeneral);
        }

        $em->persist($commande);
        $em->flush();

        return $this->json([
            'message' => 'Devis créé avec succès (Stock non débité)',
            'id' => $commande->getId(),
            'total' => $totalGeneral
        ], 201);
    }


    #[Route('/{id}/valider', methods: ['POST'])]
    public function valider(int $id, CommandeRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $commande = $repo->find($id);

        if (!$commande) {
            return $this->json(['message' => 'Commande introuvable'], 404);
        }


        if ($commande->getStatut() === 'VALIDE') {
            return $this->json(['message' => 'Cette commande est déjà validée'], 400);
        }


        foreach ($commande->getLigneCommandes() as $ligne) {
            $produit = $ligne->getProduit();
            $quantiteDemandee = $ligne->getQuantite();


            if ($produit->getStockQuantite() < $quantiteDemandee) {
                return $this->json([
                    'message' => 'Stock insuffisant pour valider : ' . $produit->getDesignation() .
                        ' (Stock actuel: ' . $produit->getStockQuantite() . ')'
                ], 400);
            }


            $nouveauStock = $produit->getStockQuantite() - $quantiteDemandee;
            $produit->setStockQuantite($nouveauStock);

            $em->persist($produit);
        }


        $commande->setStatut('VALIDE');
        $em->persist($commande);

        $em->flush();

        return $this->json(['message' => 'Commande validée et Stock mis à jour !']);
    }
}
