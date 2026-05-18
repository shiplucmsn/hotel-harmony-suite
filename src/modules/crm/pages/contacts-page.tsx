import { useMemo, useState } from "react";
import { Mail, MoreHorizontal, Phone, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PaginationBar } from "@/modules/finance/components/pagination-bar";
import type { PaginationDto } from "@/modules/finance/types";
import { CrmFilters } from "@/modules/crm/components/crm-filters";
import { ContactFormSheet } from "@/modules/crm/components/contact-form-sheet";
import { useCrmContacts, useDeleteContact } from "@/hooks/crm/use-crm";
import type { CrmContactDto } from "@/modules/crm/types";

const PER_PAGE = 12;

const emptyPagination: PaginationDto = {
  page: 1,
  perPage: PER_PAGE,
  total: 0,
  lastPage: 1,
};

function contactInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ContactsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<CrmContactDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrmContactDto | null>(null);

  const { data, isLoading, isFetching } = useCrmContacts({
    page,
    per_page: PER_PAGE,
    search: search.trim() || undefined,
  });
  const deleteContact = useDeleteContact();

  const contacts = data?.data ?? [];
  const pagination = data?.pagination ?? emptyPagination;

  const openCreate = () => {
    setEditContact(null);
    setFormOpen(true);
  };

  const openEdit = (contact: CrmContactDto) => {
    setEditContact(contact);
    setFormOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const gridSkeleton = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="mt-4 h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
          </CardContent>
        </Card>
      )),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Management"
        description="Maintain a unified directory of every person you do business with."
        breadcrumbs={[{ label: "CRM & Sales" }, { label: "Contacts" }]}
        actions={
          <Button
            className="gradient-primary border-0 text-primary-foreground"
            onClick={openCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        }
      />

      <CrmFilters
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search contacts…"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{gridSkeleton}</div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description={
            search.trim()
              ? "No contacts match your search. Try different keywords."
              : "Add your first contact to start building your directory."
          }
          action={
            !search.trim() ? (
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Contact
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching && !isLoading ? "opacity-70" : ""}`}
          >
            {contacts.map((c) => (
              <Card key={c.id} className="transition-all hover:shadow-elegant">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="gradient-primary text-primary-foreground">
                          {contactInitials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.job_title ?? c.title ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.company ?? c.company_name ?? "—"}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(c)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(c)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {c.email ?? "—"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {c.phone ?? "—"}
                    </div>
                  </div>
                  {(c.tags?.length ?? 0) > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.lastPage > 1 || pagination.total > PER_PAGE ? (
            <Card>
              <PaginationBar
                pagination={pagination}
                onPageChange={setPage}
              />
            </Card>
          ) : null}
        </>
      )}

      <ContactFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditContact(null);
        }}
        contact={editContact}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.name}” will be removed from your contact directory. This action can be undone only by an administrator if soft-delete is enabled on the server.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteContact.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteContact.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteContact.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
