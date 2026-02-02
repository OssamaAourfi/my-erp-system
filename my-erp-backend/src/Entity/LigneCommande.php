<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\LigneCommandeRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
#[ORM\Entity(repositoryClass: LigneCommandeRepository::class)]
#[ApiResource]
class LigneCommande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['commande:read', 'commande:write'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['commande:read', 'commande:write'])]
    private ?int $quantite = null;

    #[ORM\Column]
    #[Groups(['commande:read', 'commande:write'])]
    private ?float $prix_unitaire = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?Produit $produit = null;

    #[ORM\ManyToOne(targetEntity: Commande::class,inversedBy: 'ligneCommandes', cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([ 'commande:write'])]
    private ?Commande $commande = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuantite(): ?int
    {
        return $this->quantite;
    }

    public function setQuantite(int $quantite): static
    {
        $this->quantite = $quantite;

        return $this;
    }

    public function getPrixUnitaire(): ?float
    {
        return $this->prix_unitaire;
    }

    public function setPrixUnitaire(float $prix_unitaire): static
    {
        $this->prix_unitaire = $prix_unitaire;

        return $this;
    }

    public function getProduit(): ?Produit
    {
        return $this->produit;
    }

    public function setProduit(?Produit $produit): static
    {
        $this->produit = $produit;

        return $this;
    }

    public function getCommande(): ?Commande
    {
        return $this->commande;
    }

    public function setCommande(?Commande $commande): static
    {
        $this->commande = $commande;

        return $this;
    }
}
