<?php
    class QuestionForm
    {
        private $firstName;
        private $lastName;
        private $phone;
        private $email;
        private $question;
        private $mls_id;
        private $mls_num;
        private $mail;

        public function __construct($parameters) {
            require_once(dirname(__FILE__) . '/emailHandler.php');

            $this->mail = new Email();
            $this->firstName = isset($parameters['firstName']) ? $parameters['firstName'] : '';
            $this->lastName = isset($parameters['lastName']) ? $parameters['lastName'] : '';
            $this->phone = isset($parameters['phone']) ? $parameters['phone'] : '';
            $this->email = isset($parameters['email']) ? $parameters['email'] : '';
            $this->question = isset($parameters['question']) ? $parameters['question'] : '';
            $this->mls_id = isset($parameters['mls_id']) ? $parameters['mls_id'] : '';
            $this->mls_num = isset($parameters['mls_num']) ? $parameters['mls_num'] : '';
        }

        function sendEmail()
        {
            $subject = 'Submit a question';
            $body = "Hi,\n\n $this->question \n\n";
            $body .= "Listing: \n mls id: $this->mls_id \n mls#: $this->mls_num \n\n";
            $body .= "Contact me at $this->phone.\n\n";
            $body .= "Kind regards";

            $this->mail->setup();
            $this->mail->buildEmail($this->email, $subject, $body, $this->firstName, $this->lastName);
            $this->mail->send();
        }
    }
?>