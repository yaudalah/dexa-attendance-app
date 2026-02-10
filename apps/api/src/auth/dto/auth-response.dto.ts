export class AuthResponseDto {
  success: boolean;

  data: {
    accessToken: string;
    expiresIn: string;
    user: {
      id: string;
      name: string;
      email: string;
      position: string;
      photoUrl?: string;
    };
  };
}
