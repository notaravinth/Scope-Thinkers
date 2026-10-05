import { MessageCircle } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <main className="min-h-screen bg-[#2B2129] px-6 py-8 text-[#E5D1B8]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-[#C2956E] bg-[#2B2129] shadow-2xl lg:grid-cols-2">
          
          {/* Brand Section */}
          <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#DD8E58] p-10 text-[#2B2129] lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2B2129] text-[#DD8E58]">
                  <MessageCircle size={22} />
                </div>

                <span className="text-xl font-bold tracking-tight">
                  Chatter
                </span>
              </div>
            </div>

            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
                Real-time communication
              </p>

              <h1 className="max-w-md text-5xl font-bold leading-[1.05] tracking-tight">
                Conversations that feel alive.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 opacity-80">
                Connect with people, share moments, and keep every
                conversation moving in real time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#708A81]" />

              <span className="text-sm font-medium">
                Built for real-time conversations
              </span>
            </div>
          </section>

          {/* Form Section */}
          <section className="flex min-h-[650px] items-center justify-center bg-[#2B2129] p-8 sm:p-12">
            <div className="w-full max-w-md">
              <div className="mb-10 lg:hidden">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DD8E58] text-[#2B2129]">
                    <MessageCircle size={22} />
                  </div>

                  <span className="text-xl font-bold">
                    Chatter
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-[#E5D1B8]">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#C2956E]">
                  {subtitle}
                </p>
              </div>

              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;