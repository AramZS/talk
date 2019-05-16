import TenantContext from "coral-server/graph/tenant/context";
import { accept, reject } from "coral-server/services/comments/moderation";
import {
  GQLAcceptCommentInput,
  GQLRejectCommentInput,
} from "../schema/__generated__/types";

export const Actions = (ctx: TenantContext) => ({
  acceptComment: (input: GQLAcceptCommentInput) =>
    accept(ctx.mongo, ctx.redis, ctx.tenant, {
      commentID: input.commentID,
      commentRevisionID: input.commentRevisionID,
      moderatorID: ctx.user!.id,
    }),
  rejectComment: (input: GQLRejectCommentInput) =>
    reject(ctx.mongo, ctx.redis, ctx.tenant, {
      commentID: input.commentID,
      commentRevisionID: input.commentRevisionID,
      moderatorID: ctx.user!.id,
    }),
});
