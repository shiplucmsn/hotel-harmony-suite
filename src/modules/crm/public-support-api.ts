import { api } from "@/lib/api-client";
import type { ApiEnvelope } from "@/services/api/types";
import type { CrmTicketMessageDto } from "@/modules/crm/types";

export type PublicSupportTicketDto = {
  number: string;
  subject: string;
  status: string;
  priority: string;
  company_name: string;
  expires_at?: string;
  messages?: CrmTicketMessageDto[];
};

export const publicSupportApi = {
  ticket: (token: string) =>
    api
      .get<ApiEnvelope<PublicSupportTicketDto>>(`/v1/public/support/tickets/${token}`)
      .then((r) => r.data),

  sendMessage: (token: string, body: { body: string; author_name?: string }) =>
    api
      .post<ApiEnvelope<{ ticket: PublicSupportTicketDto; message: CrmTicketMessageDto }>>(
        `/v1/public/support/tickets/${token}/messages`,
        body,
      )
      .then((r) => r.data),
};
