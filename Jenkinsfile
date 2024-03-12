pipeline {
    agent any

    stages {
        stage('one') {
            steps {
                echo 'test'
            }
        }
        
stage('two') {
            steps {
                echo 'deploy'
            }
        }
        
stage('three') {
            steps {
                echo 'build'
            }
        }
    }
  post
  {
      always
      {
          emailext body: 'tesing for pipeline', subject: 'test', to: 'anid18@icloud.com'
      }
  }
}
