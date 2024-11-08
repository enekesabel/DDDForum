import { PostInput } from '../../../src/modules/posts';

export class PostInputBuilder {
  private props = {} as PostInput;

  public withPostType(postType: string) {
    this.props.postType = postType;
    return this;
  }

  public withTitle(title: string) {
    this.props.title = title;
    return this;
  }

  public withContent(content: string) {
    this.props.content = content;
    return this;
  }

  public fromMember(memberId: number) {
    this.props.memberId = memberId;
    return this;
  }
}
