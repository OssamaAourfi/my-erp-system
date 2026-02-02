<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Commande;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class CommandeProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,

        #[Autowire(service: 'api_platform.doctrine.orm.state.remove_processor')]
        private ProcessorInterface $removeProcessor
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {

        if ($operation instanceof Delete) {


            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }


        if ($data instanceof Commande) {
            if ($data->getStatut() === 'validee') {
                foreach ($data->getLigneCommandes() as $ligne) {
                    $produit = $ligne->getProduit();
                    $qty = $ligne->getQuantite();

                    if ($produit) {
                        $oldStock = $produit->getStockQuantite() ?? 0;

                        if ($data->getType() === 'vente') {
                            $produit->setStockQuantite($oldStock - $qty);
                        } elseif ($data->getType() === 'achat') {
                            $produit->setStockQuantite($oldStock + $qty);
                        }
                    }
                }
            }
        }


        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
