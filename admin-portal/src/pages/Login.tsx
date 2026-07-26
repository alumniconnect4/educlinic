import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, User } from "lucide-react"

const backgrounds = [
  "https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aW5kaWFuJTIwY29sbGVnZXxlbnwwfHwwfHx8MA%3D%3D",
]

export default function Login() {
  const [currentBg, setCurrentBg] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated()) {
      navigate("/")
    }

    // Change background every 4.5 seconds
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length)
    }, 4500)

    return () => clearInterval(interval)
  }, [isAuthenticated, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await axios.post(
        "http://localhost:4000/api/admin-portal/login",
        { email, password },
        { withCredentials: true }
      )

      if (response.status === 200) {
        login(response.data.user)
        navigate("/")
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError("An error occurred. Please try again.")
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-slate-950">
      {/* Background Images with Crossfade */}
      {backgrounds.map((bg, index) => (
        <div
          key={bg}
          className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === currentBg ? "opacity-100" : "opacity-0"
            }`}
          style={{ backgroundImage: `url(${bg})` }}
        />
      ))}

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-[400px] border-0 bg-[#36393f] shadow-2xl text-white rounded-none">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-normal text-slate-200">
            Login to your account
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-100 bg-red-500/20 border border-red-500/50 rounded-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white border-0 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm h-10"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-0 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm h-10"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-end pb-8">
            <Button type="submit" className="bg-[#4083ff] hover:bg-blue-500 text-white shadow-none rounded-sm px-6 h-9 font-normal">
              Login
            </Button>
            <div className="w-full mt-6 text-sm text-slate-400 text-left">
              Forgot your password ?<br/>
              no worries, click <a href="#" className="text-blue-400 hover:underline">here</a> to reset your password.
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
