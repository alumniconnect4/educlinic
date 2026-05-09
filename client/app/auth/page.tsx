import AuthContent from '@/components/Login/AuthContent';
import AuthForm from '@/components/Login/AuthForm';
import AuthNav from '@/components/Login/AuthNav';

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center font-sans">
      
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: 'url("https://media.istockphoto.com/id/171271182/photo/delhi-university-building-and-corridor.webp?s=2048x2048&w=is&k=20&c=63Su_Hgd1hMJ3kxaQNyXYdqXXThFhFZYENEakkFHgFs=")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >

        <div className="absolute inset-0 bg-black/50 sm:bg-linear-to-r sm:from-black/80 sm:to-black/40"></div>
      </div>

      <AuthNav />

      <div className="container mx-auto px-6 lg:px-12 xl:px-32 relative z-10 flex flex-col lg:flex-row items-center justify-between w-full mt-32 lg:mt-40 gap-12 lg:gap-20 mb-16">
        <AuthContent />
        <AuthForm />
      </div>
    </div>
  );
};

export default LoginPage;