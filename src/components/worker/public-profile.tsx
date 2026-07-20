"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  QrCode,
  Eye,
  Mail,
  Download,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AVAILABILITY_LABELS,
  EDUCATION_LABELS,
  MILITARY_LABELS,
} from "@/lib/constants";
import {
  formatSalary,
  getInitials,
  absoluteUrl,
  toWhatsAppPhone,
  formatTrPhoneDisplay,
} from "@/lib/utils";
import { toggleFavorite } from "@/lib/actions/profiles";
import type { Worker } from "@/types/database";

interface PublicProfileProps {
  worker: Worker;
  isCompany?: boolean;
  isOwner?: boolean;
  isFavorited?: boolean;
  profileUrl: string;
}

export function PublicProfileView({
  worker,
  isCompany,
  isOwner,
  isFavorited: initialFav,
  profileUrl,
}: PublicProfileProps) {
  const [favorited, setFavorited] = useState(initialFav);
  const [pending, startTransition] = useTransition();
  const avatar = worker.profile?.avatar_url;

  function handleFavorite() {
    startTransition(async () => {
      const res = await toggleFavorite(worker.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setFavorited(!favorited);
      toast.success(res.success);
    });
  }

  async function handleShare() {
    const url = absoluteUrl(profileUrl);
    if (navigator.share) {
      await navigator.share({
        title: `${worker.first_name} ${worker.last_name}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link kopyalandı");
    }
  }

  const whatsapp = toWhatsAppPhone(worker.whatsapp || worker.phone);

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-brand-orange/10 p-8 sm:p-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-28 w-28 ring-4 ring-white shadow-xl sm:h-36 sm:w-36">
            <AvatarImage src={avatar ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
              {getInitials(worker.first_name, worker.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              {worker.first_name} {worker.last_name}
            </h1>
            {worker.profession && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-lg text-muted-foreground sm:justify-start">
                <Briefcase className="h-4 w-4" />
                {worker.profession.name}
              </p>
            )}
            {worker.city && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-muted-foreground sm:justify-start">
                <MapPin className="h-4 w-4" />
                {worker.city}
                {worker.district ? ` / ${worker.district}` : ""}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                {worker.experience_years} yıl deneyim
              </Badge>
              {worker.expected_salary && (
                <Badge className="bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20">
                  {formatSalary(worker.expected_salary)}
                </Badge>
              )}
              {worker.availability && (
                <Badge variant="outline">
                  {AVAILABILITY_LABELS[worker.availability]}
                </Badge>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" /> {worker.view_count} görüntülenme
              </span>
              <span className="flex items-center gap-1 text-xs text-brand-orange">
                <Heart className="h-3 w-3" /> {worker.favorite_count} kayıt
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:justify-start">
          {isOwner && (
            <Button asChild className="shadow-md shadow-primary/20">
              <Link href="/isci/profil">
                <Pencil className="mr-1.5 h-4 w-4" />
                Profili Düzenle
              </Link>
            </Button>
          )}
          {worker.phone && (
            <Button asChild className="shadow-md shadow-primary/20">
              <a href={`tel:+${toWhatsAppPhone(worker.phone) ?? worker.phone}`}>
                <Phone className="mr-1.5 h-4 w-4" />
                Ara · {formatTrPhoneDisplay(worker.phone)}
              </a>
            </Button>
          )}
          {whatsapp && (
            <Button
              asChild
              className="bg-brand-orange text-white hover:bg-brand-orange/90 shadow-md shadow-brand-orange/20"
            >
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          )}
          {isCompany && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/firma/mesajlar?worker=${worker.id}`}>
                  Mesaj Gönder
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleFavorite}
                disabled={pending}
              >
                <Heart
                  className={`mr-1.5 h-4 w-4 ${favorited ? "fill-brand-orange text-brand-orange" : ""}`}
                />
                {favorited ? "Kaydedildi" : "Kaydet"}
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <QrCode className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Profil QR Kodu</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-4">
                <QRCodeSVG
                  value={absoluteUrl(profileUrl)}
                  size={200}
                  fgColor="#3CB371"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Skills */}
      {worker.skills && worker.skills.length > 0 && (
        <Section title="Yetenekler">
          <div className="flex flex-wrap gap-2">
            {worker.skills.map((ws) => (
              <Badge
                key={ws.id}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {ws.skill?.name}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {/* About */}
      {worker.about_me && (
        <Section title="Hakkımda">
          <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {worker.about_me}
          </p>
        </Section>
      )}

      {/* Details grid */}
      <Section title="Detaylar">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Yaş" value={worker.age?.toString()} />
          <Detail
            label="Eğitim"
            value={
              worker.education
                ? EDUCATION_LABELS[worker.education]
                : undefined
            }
          />
          <Detail
            label="Askerlik"
            value={
              worker.military_status
                ? MILITARY_LABELS[worker.military_status]
                : undefined
            }
          />
          <Detail
            label="Çalışma durumu"
            value={worker.currently_working ? "Çalışıyor" : "Açık"}
          />
          <Detail
            label="Vardiya"
            value={
              (worker as Worker & { shift_work?: boolean }).shift_work
                ? "Vardiyalı çalışmaya uygun"
                : undefined
            }
          />
          <Detail
            label="Diller"
            value={worker.languages?.join(", ")}
          />
          <Detail
            label="Ehliyet"
            value={worker.driver_license?.join(", ")}
          />
          <Detail
            label="Uzmanlıklar"
            value={worker.specializations?.join(", ")}
          />
          {worker.email && (
            <Detail
              label="E-posta"
              value={worker.email}
              icon={<Mail className="h-3.5 w-3.5" />}
            />
          )}
        </dl>
      </Section>

      {/* Certificates */}
      {worker.certificates && worker.certificates.length > 0 && (
        <Section title="Sertifikalar">
          <ul className="space-y-3">
            {worker.certificates.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border/50 p-4"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.issuer && (
                    <p className="text-sm text-muted-foreground">{c.issuer}</p>
                  )}
                </div>
                {c.file_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Portfolio */}
      {worker.portfolio_images && worker.portfolio_images.length > 0 && (
        <Section title="Portföy">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {worker.portfolio_images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={img.image_url}
                  alt={img.caption ?? "Portföy"}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {worker.cv_url && (
        <Button variant="outline" asChild>
          <a href={worker.cv_url} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            CV İndir
          </a>
        </Button>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex items-center gap-1.5 font-medium">
        {icon}
        {value}
      </dd>
    </div>
  );
}
