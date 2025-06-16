import type { ApiData } from "@/types/api"

export function getApiTemplate(api: ApiData) {
  // Base templates for different categories
  const templates = {
    Medical: {
      json: {
        patient_id: "P123456",
        symptoms: ["fever", "cough", "fatigue"],
        medical_history: {
          allergies: ["penicillin"],
          chronic_conditions: ["diabetes"],
          current_medications: ["metformin"],
        },
        vital_signs: {
          temperature: 101.2,
          blood_pressure: "120/80",
          heart_rate: 85,
        },
        request_type: "diagnosis_assistance",
      },
      file: {
        patient_id: "P123456",
        file_type: "medical_record",
        file_format: "pdf",
        analysis_type: "comprehensive_review",
        include_recommendations: true,
      },
    },
    Hackathons: {
      json: {
        project_name: "AI Innovation Platform",
        team_members: ["John Doe", "Jane Smith"],
        project_description: "An AI-powered platform for innovation management",
        technologies_used: ["React", "Node.js", "Python", "TensorFlow"],
        github_url: "https://github.com/team/project",
        demo_url: "https://demo.project.com",
        evaluation_criteria: ["innovation", "technical_implementation", "user_experience", "business_potential"],
      },
      file: {
        project_name: "AI Innovation Platform",
        submission_type: "presentation",
        file_format: "pdf",
        evaluation_focus: ["technical_depth", "innovation_level", "presentation_quality"],
        include_scoring: true,
      },
    },
    General: {
      json: {
        query: "What are the latest trends in artificial intelligence?",
        context: "technology research",
        response_format: "detailed",
        include_sources: true,
        max_length: 500,
      },
      file: {
        task_type: "document_analysis",
        file_format: "pdf",
        analysis_depth: "comprehensive",
        output_format: "summary_with_insights",
        language: "english",
      },
    },
    Education: {
      json: {
        student_id: "S123456",
        course_code: "CS101",
        learning_objective: "Understanding basic programming concepts",
        current_level: "beginner",
        preferred_learning_style: "visual",
        session_duration: 60,
        topics_to_cover: ["variables", "loops", "functions"],
      },
      file: {
        student_id: "S123456",
        document_type: "assignment",
        file_format: "pdf",
        evaluation_type: "comprehensive_feedback",
        grading_rubric: "standard",
        include_suggestions: true,
      },
    },
  }

  return templates[api.category as keyof typeof templates] || templates.General
}
