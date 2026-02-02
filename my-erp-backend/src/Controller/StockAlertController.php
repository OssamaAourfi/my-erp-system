<?php

namespace App\Controller;

use App\Repository\ProduitRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/custom/alerts')]
class StockAlertController extends AbstractController
{
    #[Route('/stock', methods: ['GET'])]
    public function getLowStock(ProduitRepository $repo): JsonResponse
    {
        
        $seuil = 5;

        $qb = $repo->createQueryBuilder('p')
            ->where('p.stock_quantite <= :seuil')
            ->setParameter('seuil', $seuil)
            ->orderBy('p.stock_quantite', 'ASC');

        $produits = $qb->getQuery()->getResult();

        $data = [];
        foreach ($produits as $p) {
            $data[] = [
                'id' => $p->getId(),
                'designation' => $p->getDesignation(),
                'reference' => $p->getReference(),
                'stock' => $p->getStockQuantite(),
                'image' => $p->getImage()
            ];
        }

        return $this->json($data);
    }
}
