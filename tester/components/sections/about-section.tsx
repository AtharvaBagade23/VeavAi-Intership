import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, Zap, Shield } from "lucide-react"

export function AboutSection() {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      title: "Fast & Efficient",
      description: "Test APIs without incurring costs during development",
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: "Secure Testing",
      description: "Safe environment for API experimentation",
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: "Multiple Specialists",
      description: "Access to various AI avatars and specialists",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-cyan-500" />,
      title: "User Friendly",
      description: "Intuitive interface for developers",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in slide-in-from-bottom duration-500">
      <Card className="veavai-glass border-0 shadow-2xl shadow-blue-500/10">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Developer Tool
            </Badge>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            About VeavAI API Tester
          </CardTitle>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A secure, efficient, and user-friendly tool to simulate and test VeavAI APIs without incurring ChatGPT API
            costs during development.
          </p>
        </CardHeader>
        <CardContent className="space-y-12">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl veavai-glass hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* About VeavAI */}
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                About VeavAI
              </h3>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 p-8 rounded-2xl">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-6">
                At VeavAI, we have created a Marketplace of AI Specialists and Avatars. We harness the power of AI to
                bring precision, fairness, and efficiency across different industries. Whether it's hackathon Judges,
                medical coding Specialists, legal Compliance, performance Assessment, or innovation Evaluation, you can
                search our Marketplace and integrate our AI-driven Avatars/Specialists with other humans to provide
                unbiased decision-making.
              </p>
              <div className="text-center">
                <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                  One Platform. Infinite Experts.
                </h4>
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">AI Avatars As A Service</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
