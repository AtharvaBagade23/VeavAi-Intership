import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, Github, ExternalLink } from "lucide-react"

export function ContactSection() {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Get help with technical issues",
      action: "support@veavai.com",
      href: "mailto:support@veavai.com",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "General Inquiries",
      description: "Questions about our services",
      action: "Contact Us",
      href: "mailto:info@veavai.com",
    },
    {
      icon: <Github className="h-6 w-6" />,
      title: "Documentation",
      description: "API docs and guides",
      action: "View Docs",
      href: "#",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in slide-in-from-right duration-500">
      <Card className="veavai-glass border-0 shadow-2xl shadow-blue-500/10">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Contact Us
          </CardTitle>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Have questions or need support? We're here to help!
          </p>
        </CardHeader>
        <CardContent className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl veavai-glass hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-4 text-blue-600 dark:text-blue-400">{method.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{method.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{method.description}</p>
                <Button
                  asChild
                  className="veavai-gradient hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <a href={method.href} className="inline-flex items-center">
                    {method.action}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
