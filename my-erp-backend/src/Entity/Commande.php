<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\CommandeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\MaxDepth;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use App\State\CommandeProcessor;

#[ORM\Entity(repositoryClass: CommandeRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    processor: CommandeProcessor::class,
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Delete(),
        new Put(),
        new Patch()
    ],
    normalizationContext: ['groups' => ['commande:read'], 'enable_max_depth' => true],
    denormalizationContext: ['groups' => ['commande:write']],
    paginationClientItemsPerPage: true,
)]
#[ApiFilter(SearchFilter::class, properties: ['type' => 'exact', 'reference' => 'partial', 'statut' => 'exact'])] // Zedt statut f filter bach tqder t-filtri bih mn b3d
#[ApiFilter(DateFilter::class, properties: ['date'])]
class Commande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['commande:read', 'commande:write'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?string $reference = null;

    #[ORM\Column]
    #[Groups(['commande:read', 'commande:write'])]
    private ?\DateTime $date = null;

    #[ORM\ManyToOne(inversedBy: 'commandes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?Partenaire $partenaire = null;

    #[ORM\Column(length: 20)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?string $type = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?float $total = null;

    /**
     * @var Collection<int, LigneCommande>
     */
    #[ORM\OneToMany(targetEntity: LigneCommande::class, mappedBy: 'commande', orphanRemoval: true, cascade: ['persist', 'remove'])]
    #[Groups(['commande:read', 'commande:write'])]
    #[MaxDepth(1)]
    private Collection $ligneCommandes;


    #[ORM\Column(length: 20)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?string $statut = 'devis';

    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: Paiement::class, orphanRemoval: true)]
    #[Groups(['read:commande'])]
    private Collection $paiements;

    public function __construct()
    {
        $this->ligneCommandes = new ArrayCollection();
        $this->statut = 'devis';
        $this->paiements = new ArrayCollection();
    }
    /**
     * @return Collection<int, Paiement>
     */
    public function getPaiements(): Collection
    {
        return $this->paiements;
    }

    public function addPaiement(Paiement $paiement): static
    {
        if (!$this->paiements->contains($paiement)) {
            $this->paiements->add($paiement);
            $paiement->setCommande($this);
        }
        return $this;
    }

    public function removePaiement(Paiement $paiement): static
    {
        if ($this->paiements->removeElement($paiement)) {
       
            if ($paiement->getCommande() === $this) {
                $paiement->setCommande(null);
            }
        }
        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function setReference(string $reference): static
    {
        $this->reference = $reference;
        return $this;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;
        return $this;
    }

    public function getPartenaire(): ?Partenaire
    {
        return $this->partenaire;
    }

    public function setPartenaire(?Partenaire $partenaire): static
    {
        $this->partenaire = $partenaire;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getTotal(): ?float
    {
        return $this->total;
    }

    public function setTotal(float $total): static
    {
        $this->total = $total;
        return $this;
    }

    public function getLigneCommandes(): Collection
    {
        return $this->ligneCommandes;
    }

    public function addLigneCommande(LigneCommande $ligneCommande): static
    {
        if (!$this->ligneCommandes->contains($ligneCommande)) {
            $this->ligneCommandes->add($ligneCommande);
            $ligneCommande->setCommande($this);
        }
        return $this;
    }

    public function removeLigneCommande(LigneCommande $ligneCommande): static
    {
        if ($this->ligneCommandes->removeElement($ligneCommande)) {
            if ($ligneCommande->getCommande() === $this) {
                $ligneCommande->setCommande(null);
            }
        }
        return $this;
    }

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function calculateTotal(): void
    {
        $this->total = 0;
        foreach ($this->getLigneCommandes() as $ligne) {
            $quantite = $ligne->getQuantite() ?? 0;
            $prix = $ligne->getPrixUnitaire() ?? 0;
            $this->total += ($quantite * $prix);
        }
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }
}
