import Link from "next/link";
import { MapPin, Briefcase, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatSalary, getInitials } from "@/lib/utils";
import type { Worker } from "@/types/database";

interface WorkerCardProps {
  worker: Worker;
  showFavorite?: boolean;
}

export function WorkerCard({ worker }: WorkerCardProps) {
  const avatar = worker.profile?.avatar_url;
  const profession = worker.profession?.name;

  return (
    <Link
      href={`/isci/${worker.slug}`}
      className="group block rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 ring-2 ring-primary/10 transition-transform group-hover:scale-105">
          <AvatarImage src={avatar ?? undefined} alt={worker.first_name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getInitials(worker.first_name, worker.last_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold group-hover:text-primary transition-colors">
              {worker.first_name} {worker.last_name}
            </h3>
            {worker.favorite_count > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-brand-orange">
                <Heart className="h-3 w-3 fill-current" />
                {worker.favorite_count}
              </span>
            )}
          </div>
          {profession && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              {profession}
            </p>
          )}
          {worker.city && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {worker.city}
              {worker.district ? `, ${worker.district}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          {worker.experience_years} yıl deneyim
        </Badge>
        {worker.expected_salary && (
          <Badge
            variant="outline"
            className="border-brand-orange/30 text-brand-orange font-normal"
          >
            {formatSalary(worker.expected_salary)}
          </Badge>
        )}
      </div>

      {worker.skills && worker.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {worker.skills.slice(0, 3).map((ws) => (
            <span
              key={ws.id}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {ws.skill?.name}
            </span>
          ))}
          {worker.skills.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{worker.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
