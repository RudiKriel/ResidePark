<?php
    class Email
    {
        protected static $mailer;

        public function __construct() {
            require_once('./PHPMailer/class.phpmailer.php');
        }

        public function setup() {
            if (!isset(self::$mailer)) {
                $config = parse_ini_file('../emailConfig.ini');

                self::$mailer = new PHPMailer();

                self::$mailer->IsHTML(true);
                self::$mailer->IsSMTP();
                self::$mailer->SMTPDebug = $config['debug'];
                self::$mailer->SMTPAuth = $config['auth'];
                self::$mailer->SMTPSecure = $config['secure'];
                self::$mailer->Host = $config['host'];
                self::$mailer->Port = $config['port'];
                self::$mailer->Username = $config['username'];
                self::$mailer->Password = $config['password'];
                self::$mailer->SetFrom($config['from'], $config['fromName']);
                self::$mailer->WordWrap = 60;
                self::$mailer->Priority = 1;
            }

            return self::$mailer;
        }

        public function buildEmail($to, $subject, $body, $firstName, $lastName) {
            self::$mailer->AddAddress($to, "$firstName $lastName");
            self::$mailer->Subject = $subject;
            self::$mailer->Body = nl2br($body);
        }

        public function send() {
            $sent = self::$mailer->Send();

            if (!$sent && !empty(self::$mailer->ErrorInfo)) {
                var_dump(self::$mailer->ErrorInfo);
                die();
            }
        }
    }
?>