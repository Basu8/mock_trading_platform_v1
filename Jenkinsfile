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
          emailext body: 'devops', subject: 'testing', to: 'anid180@proton.me'
      }
  }
}
